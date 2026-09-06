export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { BusinessStore, type BusinessStatus } from '@/lib/business_store';
import { validateBusinessPayload } from '@/lib/validation';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { buildInventoryApiContract, filterInventoryItems, filterPublicInventory, resolveInventoryAccess } from '@/lib/public_inventory_contract.mjs';

function publicInventoryUnavailableResponse() {
  return NextResponse.json(
    {
      error: 'GUAKI_PUBLIC_INVENTORY_UNAVAILABLE',
      availability: { status: 'unavailable', source: 'persistent_inventory' },
      items: [],
      total: 0,
      emptyState: 'public_inventory_unavailable',
      message: 'Sin datos todavía',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as BusinessStatus | null;
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const session = request.cookies.get('guaki_session')?.value;
    let access = resolveInventoryAccess({
      nodeEnv: process.env.NODE_ENV,
      localTestToken: process.env.GUAKI_LOCAL_TEST_INVENTORY_TOKEN,
      presentedLocalTestToken: request.headers.get('x-guaki-local-test-inventory') ?? undefined,
    });
    let items;
    if (isSupabaseConfigured() && session) {
      const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
      if (actorError || !actor.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
      const isAdmin = actor.user.app_metadata?.role === 'admin';
      access = resolveInventoryAccess({ actor: { id: actor.user.id, role: isAdmin ? 'admin' : 'owner' } });
      items = await GuakiDataService.getBusinessesWithToken(session, {
        status: status || undefined,
        city: city || undefined,
        category: category || undefined,
        ownerId: isAdmin ? undefined : actor.user.id,
      });
    } else if (isSupabaseConfigured()) {
      try {
        items = await GuakiDataService.getAllBusinesses({ status: 'published' });
      } catch {
        return publicInventoryUnavailableResponse();
      }
    } else if (access.authorized) {
      items = status ? BusinessStore.getByStatus(status) : BusinessStore.getAll();
    } else {
      return publicInventoryUnavailableResponse();
    }
    const filters = { city: city || '', category: category || '', search: search || '' };
    const publicInventory = filterPublicInventory(items, {});
    items = access.authorized ? filterInventoryItems(items, filters) : filterPublicInventory(items, filters);

    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }

    const contract = buildInventoryApiContract({
      items,
      publicInventoryTotal: publicInventory.length,
      filters,
      access,
    });

    const metricsOnly = searchParams.get('metrics') === 'true';
    if (metricsOnly) {
      return NextResponse.json(
        {
          totalPublished: publicInventory.length,
          timestamp: new Date().toISOString(),
          ...(access.authorized ? { metrics: BusinessStore.getMetrics() } : {}),
        },
        { headers: contract.headers }
      );
    }

    return NextResponse.json(
      {
        ...contract.body,
        timestamp: new Date().toISOString(),
        ...(access.authorized ? { metrics: BusinessStore.getMetrics() } : {}),
      },
      {
        headers: contract.headers,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al consultar negocios.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const validation = validateBusinessPayload(payload, false);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          error: 'Datos de negocio inválidos.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const session = request.cookies.get('guaki_session')?.value;
    if (isSupabaseConfigured() && session) {
      const { data: actor, error } = await getSupabaseClient().auth.getUser(session);
      if (error || !actor.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
      const newBusiness = await GuakiDataService.createBusinessWithToken(
        {
          id: `GKI-${crypto.randomUUID()}`,
          ...validation.data,
          ownerId: actor.user.id,
          ownerEmail: actor.user.email || null,
          claimStatus: 'pending',
          // A provider can submit a draft; only the audit/admin flow may publish.
          status: 'draft',
        },
        session,
      );
      return NextResponse.json(newBusiness, { status: 201 });
    }

    return NextResponse.json(
      { error: 'PERSISTENCE_UNAVAILABLE', message: 'Durable Supabase persistence is required for business writes.' },
      { status: 503 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al crear negocio.' },
      { status: 500 }
    );
  }
}
