export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { validateAuditDecision } from '@/lib/validation';

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
