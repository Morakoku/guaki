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
    const { businessId, method, reference, amount, currency } = body;

    if (!businessId || !method || !reference || !amount || !currency) {
      return NextResponse.json(
        { error: 'FALTAN_DATOS', message: 'Se requieren businessId, method, reference, amount y currency.' },
        { status: 400 }
      );
    }

    if (currency !== 'VES') {
      return NextResponse.json(
        { error: 'MONEDA_NO_SUPPORTED', message: 'Solo se soportan pagos en VES (Bolívares).' },
        { status: 400 }
      );
    }

    if (method !== 'pagomovil' && method !== 'zelle') {
      return NextResponse.json(
        { error: 'METODO_NO_SUPPORTED', message: 'Método no soportado. Use pagomovil o zelle.' },
        { status: 400 }
      );
    }

    // Actualizar el negocio: plan=verified, payment_method, plan_source='manual_ve', plan_expires_at=now()+1año
    const planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const updated = await GuakiDataService.updateBusinessWithToken(businessId, {
      plan: 'verified',
      payment_method: method,
      plan_source: 'manual_ve',
      plan_expires_at: planExpiresAt,
    }, token);

    if (!updated) {
      return NextResponse.json(
        { error: 'NEGOCIO_ACTUALIZACION_FAILED' },
        { status: 500 }
      );
    }

    // Append al log admin: evento de pago verificado
    await GuakiDataService.recordEvent('admin_action', {
      action: 'payment_verified',
      target: updated.name || businessId,
      target_id: businessId,
      actor_id: actor.user.id,
      reason: `Pago VE verificado por ${method} - referencia: ${reference}, monto: ${amount} ${currency}`,
      origen: 'admin-payments-verify',
    }).catch(() => undefined);

    return NextResponse.json({
      message: `Pago VE verificado exitosamente para el negocio ${updated.name || businessId}`,
      business: updated,
      plan_source: 'manual_ve',
      plan_expires_at: planExpiresAt,
      persistence: 'supabase',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar verificación de pago VE.' },
      { status: 500 }
    );
  }
}