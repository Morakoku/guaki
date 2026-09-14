export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, recordAdminEvent } from '@/lib/admin_server';

const PRICING_DEFAULTS = {
  priceVerificado: 49900,
  priceVip: 149900,
  flashDiscountEnabled: false,
  flashDiscountPercent: 20,
};

function coercePricing(raw: unknown): typeof PRICING_DEFAULTS {
  const v = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const num = (x: unknown, fallback: number) => {
    const n = Number(x);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
  };
  return {
    priceVerificado: num(v.priceVerificado, PRICING_DEFAULTS.priceVerificado),
    priceVip: num(v.priceVip, PRICING_DEFAULTS.priceVip),
    flashDiscountEnabled: Boolean(v.flashDiscountEnabled),
    flashDiscountPercent: Math.min(90, num(v.flashDiscountPercent, PRICING_DEFAULTS.flashDiscountPercent)),
  };
}

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  const { data, error } = await ctx.admin
    .from('platform_settings')
    .select('value,updated_at')
    .eq('key', 'pricing')
    .maybeSingle();
  if (error) {
    console.error('[admin] settings read failed:', error.message);
    return NextResponse.json({ ok: true, pricing: PRICING_DEFAULTS, persisted: false });
  }
  return NextResponse.json(
    { ok: true, pricing: coercePricing(data?.value), persisted: Boolean(data), updatedAt: data?.updated_at || null },
    { headers: { 'Cache-Control': 'no-store, private' } },
  );
}

export async function PUT(request: NextRequest) {
  const ctx = await adminClient(request);
  if ('denied' in ctx) return ctx.denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }
  const pricing = coercePricing(body);

  const { error } = await ctx.admin
    .from('platform_settings')
    .upsert({ key: 'pricing', value: pricing, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) {
    console.error('[admin] settings write failed:', error.message);
    return NextResponse.json(
      { error: 'SETTINGS_WRITE_FAILED', message: 'No se pudieron guardar los precios (¿migración aplicada?).' },
      { status: 502 },
    );
  }

  await recordAdminEvent(ctx.admin, ctx.actorId, 'admin_action', {
    action: 'pricing_update',
    target: 'platform_settings',
    target_id: 'pricing',
    reason: `verificado=${pricing.priceVerificado} vip=${pricing.priceVip} flash=${pricing.flashDiscountEnabled ? pricing.flashDiscountPercent + '%' : 'off'}`,
    origen: 'admin-panel',
  });

  return NextResponse.json({ ok: true, pricing, persisted: true });
}
