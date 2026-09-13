export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { validateAuditDecision } from '@/lib/validation';
import { notifyBusinessAudit } from '@/lib/notifications';

interface Props {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const token = request.cookies.get('guaki_session')?.value;
    if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
      return NextResponse.json({ error: 'ADMIN_PERSISTENCE_NOT_CONFIGURED' }, { status: 503 });
    }
    const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(token);
    if (actorError || !actor.user || actor.user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud inválido o JSON malformado.' },
        { status: 400 }
      );
    }

    const validation = validateAuditDecision(payload);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: 'Datos de decisión inválidos.', details: validation.errors },
        { status: 400 }
      );
    }

    const { decision, notes } = validation.data;
    // Razon obligatoria al rechazar (patron de colas de moderacion): el
    // comerciante debe recibir que corregir, y el audit log queda con motivo.
    if (decision === 'rejected' && !String(notes || '').trim()) {
      return NextResponse.json(
        { error: 'AUDIT_REASON_REQUIRED', message: 'Describe el motivo del rechazo para que el negocio pueda corregirlo.' },
        { status: 400 },
      );
    }
    const current = await GuakiDataService.getBusinessByIdWithToken(params.id, token);
    if (!current) return NextResponse.json({ error: 'Negocio no encontrado para auditoría.' }, { status: 404 });
    if (decision === 'approved' && (current.claimStatus !== 'pending' || current.status !== 'in_audit')) {
      return NextResponse.json({ error: 'CLAIM_PENDING_AUDIT_REQUIRED' }, { status: 409 });
    }
    if (decision === 'published' && (current.claimStatus !== 'verified' || current.status !== 'approved')) {
      return NextResponse.json({ error: 'CLAIM_VERIFIED_APPROVAL_REQUIRED' }, { status: 409 });
    }
    const updated = await GuakiDataService.updateBusinessWorkflowWithToken(params.id, {
      status: decision,
      claimStatus: decision === 'approved' ? 'verified' : decision === 'published' ? 'verified' : 'rejected',
      auditNotes: notes,
      approvedAt: decision === 'approved' || decision === 'published' ? new Date().toISOString() : undefined,
    }, token);

    // Loop transaccional (mensajes 2 y 3): aviso de aprobado / rechazo con checklist.
    if (decision === 'rejected') {
      await notifyBusinessAudit('audit_rejected', {
        businessName: updated?.name || params.id,
        businessId: params.id,
        ownerName: updated?.ownerEmail ? updated.ownerEmail.split('@')[0] : null,
        recipientEmail: updated?.ownerEmail || null,
        notes: notes || null,
      });
    } else if (decision === 'approved' || decision === 'published') {
      await notifyBusinessAudit('audit_approved', {
        businessName: updated?.name || params.id,
        businessId: params.id,
        ownerName: updated?.ownerEmail ? updated.ownerEmail.split('@')[0] : null,
        recipientEmail: updated?.ownerEmail || null,
      });
    }

    // Audit log append-only de toda decision del admin.
    await GuakiDataService.recordEvent('admin_action', {
      action: `audit_${decision}`,
      target: updated?.name || params.id,
      target_id: params.id,
      actor_id: actor.user.id,
      reason: String(notes || '').slice(0, 500) || null,
      origen: 'admin-panel',
    }).catch(() => undefined);

    return NextResponse.json({
      message: `Decisión de auditoría procesada exitosamente: ${decision}`,
      business: updated,
      status: updated.status,
      persistence: 'supabase',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar decisión de auditoría.' },
      { status: 500 }
    );
  }
}
