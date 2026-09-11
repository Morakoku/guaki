import { NextRequest, NextResponse } from 'next/server';
import { BusinessStore, calculateProfileProgress } from '@/lib/business_store';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  validateInquiryPayload,
  validateReviewPayload,
  validateBusinessPayload,
} from '@/lib/validation';
import { resolveInventoryAccess } from '@/lib/public_inventory_contract.mjs';
import { notifyBusinessAudit } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

function publicInventoryUnavailableResponse() {
  return NextResponse.json(
    {
      error: 'GUAKI_PUBLIC_INVENTORY_UNAVAILABLE',
      availability: { status: 'unavailable', source: 'persistent_inventory' },
      business: null,
      emptyState: 'public_inventory_unavailable',
      message: 'Sin datos todavía',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

function isAuthorizationFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; status?: number; statusCode?: number; message?: string };
  return candidate.status === 401 || candidate.status === 403 || candidate.statusCode === 401 || candidate.statusCode === 403
    || candidate.code === '42501'
    || /row-level security|permission denied|not authorized|unauthorized/i.test(candidate.message || '');
}

function authorizationResponse(error: unknown, fallback: string) {
  if (isAuthorizationFailure(error)) {
    return NextResponse.json({ error: 'FORBIDDEN', code: 'AUTHORIZATION_DENIED' }, { status: 403 });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 },
  );
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const token = request.cookies.get('guaki_session')?.value;
    let business;
    if (isSupabaseConfigured()) {
      if (token && !token.startsWith('dev-') && !token.startsWith('usr_local_')) {
        const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(token);
        if (actorError || !actor.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
        business = await GuakiDataService.getBusinessByIdWithToken(params.id, token);
        const role = actor.user.app_metadata?.role;
        if (business && role === 'provider' && business.ownerId !== actor.user.id) {
          return NextResponse.json({ error: 'BUSINESS_NOT_ACCESSIBLE' }, { status: 404 });
        }
      } else {
        business = await GuakiDataService.getBusinessById(params.id);
      }
    } else {
      const access = resolveInventoryAccess({
        nodeEnv: process.env.NODE_ENV,
        localTestToken: process.env.GUAKI_LOCAL_TEST_INVENTORY_TOKEN,
        presentedLocalTestToken: request.headers.get('x-guaki-local-test-inventory') ?? undefined,
      });
      if (!access.authorized) return publicInventoryUnavailableResponse();
      business = BusinessStore.getById(params.id) || BusinessStore.getBySlug(params.id);
    }
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado.' }, { status: 404 });
    }

    // H-07 FIX: Strip sensitive PII (ownerEmail, ownerId, auditNotes) for public consumers
    let safeBusiness = business;
    const actorId = token && isSupabaseConfigured() ? (await getSupabaseClient().auth.getUser(token)).data?.user?.id : null;
    const actorRole = token && isSupabaseConfigured() ? (await getSupabaseClient().auth.getUser(token)).data?.user?.app_metadata?.role : null;
    const isOwnerOrAdmin = actorRole === 'admin' || (actorId && business.ownerId === actorId);

    if (!isOwnerOrAdmin) {
      const { ownerEmail, ownerId, auditNotes, ...publicFields } = business as any;
      safeBusiness = publicFields;
    }

    const progress = calculateProfileProgress(business);
    return NextResponse.json({ business: safeBusiness, progress });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener negocio.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud inválido o JSON malformado.' },
        { status: 400 }
      );
    }

    const action = payload.action;

    if (isSupabaseConfigured()) {
      const session = request.cookies.get('guaki_session')?.value;
      if (!session || session.startsWith('dev-') || session.startsWith('usr_local_')) {
        return NextResponse.json({ error: 'AUTH_REQUIRED_FOR_PERSISTENT_WRITE' }, { status: 401 });
      }
      const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
      if (actorError || !actor.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });

      if (action === 'inquiry' || action === 'quote' || action === 'appointment') {
        const validation = validateInquiryPayload(payload);
        if (!validation.success || !validation.data) {
          return NextResponse.json({ error: 'Datos de consulta inválidos.', details: validation.errors }, { status: 400 });
        }
        const inquiry = await GuakiDataService.addInquiryWithToken(params.id, validation.data, session, actor.user.id);
        return NextResponse.json({ success: true, inquiry, persistence: 'supabase' }, { status: 201 });
      }

      if (action === 'review') {
        const validation = validateReviewPayload(payload);
        if (!validation.success || !validation.data) {
          return NextResponse.json({ error: 'Datos de reseña inválidos.', details: validation.errors }, { status: 400 });
        }
        const review = await GuakiDataService.addReviewWithToken(params.id, validation.data, session, actor.user.id);
        return NextResponse.json({ success: true, review, persistence: 'supabase' }, { status: 201 });
      }
    }

    if (action === 'inquiry' || action === 'quote' || action === 'appointment' || action === 'review') {
      return NextResponse.json(
        { error: 'PERSISTENCE_UNAVAILABLE', message: 'Durable Supabase persistence is required for writes.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'Acción no soportada. Acciones válidas: inquiry, quote, appointment, review.' },
      { status: 400 }
    );
  } catch (error) {
    return authorizationResponse(error, 'Error procesando solicitud.');
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud inválido o JSON malformado.' },
        { status: 400 }
      );
    }

    const action = payload.action;

    const session = request.cookies.get('guaki_session')?.value;
    if (isSupabaseConfigured() && (!session || session.startsWith('dev-') || session.startsWith('usr_local_'))) {
      return NextResponse.json({ error: 'AUTH_REQUIRED_FOR_PERSISTENT_WRITE' }, { status: 401 });
    }
    if (isSupabaseConfigured() && session && !session.startsWith('dev-') && !session.startsWith('usr_local_')) {
      const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
      if (actorError || !actor.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
      if (actor.user.app_metadata?.role === 'client') {
        return NextResponse.json({ error: 'FORBIDDEN', code: 'PROVIDER_WRITE_REQUIRED' }, { status: 403 });
      }
      const accessibleBusiness = await GuakiDataService.getBusinessByIdWithToken(params.id, session);
      if (!accessibleBusiness) {
        return NextResponse.json({ error: 'FORBIDDEN', code: 'BUSINESS_NOT_ACCESSIBLE' }, { status: 403 });
      }
      if (
        actor.user.app_metadata?.role !== 'admin' &&
        accessibleBusiness.ownerId &&
        accessibleBusiness.ownerId !== actor.user.id &&
        accessibleBusiness.ownerEmail !== actor.user.email
      ) {
        return NextResponse.json({ error: 'FORBIDDEN', code: 'BUSINESS_NOT_ACCESSIBLE' }, { status: 403 });
      }
      if (action === 'update_inquiry') {
        const { inquiryId, status } = payload;
        const validStatuses = ['new', 'contacted', 'quoted', 'scheduled', 'closed'];
        if (!inquiryId || !validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Parámetros de consulta inválidos.' }, { status: 400 });
        }
        const ok = await GuakiDataService.updateInquiryStatusWithToken(inquiryId, status, session);
        if (!ok) return NextResponse.json({ error: 'Consulta no encontrada o no autorizada.' }, { status: 404 });
        return NextResponse.json({ success: true, inquiryId, status, persistence: 'supabase' });
      }
      if (action === 'submit_audit') {
        const updated = await GuakiDataService.updateBusinessWorkflowWithToken(
          params.id,
          { status: 'in_audit', claimStatus: 'pending' },
          session,
        );
        // Loop transaccional (mensaje 1): acuse de recepción a la cola de auditoría.
        await notifyBusinessAudit('audit_received', {
          businessName: updated?.name || params.id,
          businessId: params.id,
          ownerName: updated?.ownerEmail ? updated.ownerEmail.split('@')[0] : null,
          recipientEmail: updated?.ownerEmail || null,
        });
        return NextResponse.json({ business: updated, next: 'IN_AUDIT', persistence: 'supabase' });
      }
      if (action === 'audit_decision') {
        const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
        const role = actor.user?.app_metadata?.role;
        if (actorError || !actor.user || role !== 'admin') {
          return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
        }
        const decision = payload.decision;
        if (!['approved', 'rejected', 'published'].includes(decision)) {
          return NextResponse.json({ error: 'INVALID_AUDIT_DECISION' }, { status: 400 });
        }
        const current = await GuakiDataService.getBusinessByIdWithToken(params.id, session);
        if (!current) return NextResponse.json({ error: 'BUSINESS_NOT_FOUND' }, { status: 404 });
        if (decision === 'published' && current.claimStatus !== 'verified') {
          return NextResponse.json({ error: 'CLAIM_MUST_BE_VERIFIED_BEFORE_PUBLISH' }, { status: 409 });
        }
        const updated = await GuakiDataService.updateBusinessWorkflowWithToken(
          params.id,
          {
            status: decision,
            claimStatus: decision === 'approved' || decision === 'published' ? 'verified' : 'rejected',
            auditNotes: typeof payload.auditNotes === 'string' ? payload.auditNotes : undefined,
            approvedAt: decision === 'approved' || decision === 'published' ? new Date().toISOString() : undefined,
          },
          session,
        );
        return NextResponse.json({ business: updated, next: decision.toUpperCase(), persistence: 'supabase' });
      }
      const validation = validateBusinessPayload(payload, true);
      if (!validation.success || !validation.data) {
        return NextResponse.json({ error: 'Datos de actualización inválidos.', details: validation.errors }, { status: 400 });
      }
      const updated = await GuakiDataService.updateBusinessWithToken(params.id, validation.data, session);
      return NextResponse.json({ business: updated, progress: calculateProfileProgress(updated), persistence: 'supabase' });
    }

    if (action === 'submit_audit' || action === 'update_inquiry' || action === 'update_business') {
      return NextResponse.json(
        { error: 'PERSISTENCE_UNAVAILABLE', message: 'Durable Supabase persistence is required for writes.' },
        { status: 503 },
      );
    }

    const validation = validateBusinessPayload(payload, true);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: 'Datos de actualización inválidos.', details: validation.errors },
        { status: 400 }
      );
    }

    const updated = BusinessStore.update(params.id, validation.data);
    if (!updated) {
      return NextResponse.json(
        { error: 'Negocio no encontrado para actualizar.' },
        { status: 404 }
      );
    }

    const progress = calculateProfileProgress(updated);
    return NextResponse.json({ business: updated, progress });
  } catch (error) {
    return authorizationResponse(error, 'Error al actualizar negocio.');
  }
}

export async function PUT(request: NextRequest, props: Props) {
  return PATCH(request, props);
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    if (isSupabaseConfigured()) return NextResponse.json({ error: 'DELETE_FLOW_PENDING_ADMIN_ROUTE' }, { status: 409 });
    const deleted = BusinessStore.delete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Negocio no encontrado para eliminar.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Negocio eliminado exitosamente.' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar negocio.' },
      { status: 500 }
    );
  }
}
