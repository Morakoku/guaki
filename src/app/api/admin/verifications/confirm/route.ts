import { NextRequest, NextResponse } from 'next/server';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('guaki_session')?.value;
    if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
      return NextResponse.json({ error: 'ADMIN_PERSISTENCE_NOT_CONFIGURED' }, { status: 503 });
    }
    const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(token);
    if (actorError || !actor.user || actor.user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }

    const body = await request.json();
    const { businessId, decision } = body;

    if (!businessId || !decision) {
      return NextResponse.json(
        { error: 'FALTAN_DATOS', message: 'Se requieren businessId y decision (verified/pending).' },
        { status: 400 }
      );
    }

    if (decision !== 'verified' && decision !== 'pending') {
      return NextResponse.json(
        { error: 'DECISION_INVALIDA', message: 'Decision debe ser "verified" o "pending".' },
        { status: 400 }
      );
    }

    // Actualizar el negocio: setear number_verified según la decisión
    const updated = await GuakiDataService.updateBusinessWithToken(businessId, {
      number_verified: decision,
    }, token);

    if (!updated) {
      return NextResponse.json(
        { error: 'NEGOCIO_ACTUALIZACION_FAILED' },
        { status: 500 }
      );
    }

    // Append al log admin: evento de verificación de número
    await GuakiDataService.recordEvent('admin_action', {
      action: 'number_verified',
      target: updated.name || businessId,
      target_id: businessId,
      actor_id: actor.user.id,
      reason: `Número de contacto ${decision === 'verified' ? 'confirmado' : 'pendiente'} por admin - negocio: ${updated.name || businessId}`,
      origen: 'admin-verifications-confirm',
    }).catch(() => undefined);

    return NextResponse.json({
      message: `Número de contacto ${decision === 'verified' ? 'confirmado' : 'puesto en pending'} exitosamente para el negocio ${updated.name || businessId}`,
      business: updated,
      number_verified: decision,
      persistence: 'supabase',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar confirmación de número.' },
      { status: 500 }
    );
  }
}