export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GuakiDataService, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

async function adminClient(request: NextRequest) {
  const token = request.cookies.get('guaki_session')?.value;
  if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
    return { denied: NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 }) } as const;
  }
  const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
  if (error || actor.user?.app_metadata?.role !== 'admin') {
    return { denied: NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 }) } as const;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceKey) return { denied: NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 }) } as const;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  return { admin, actorId: actor.user.id } as const;
}

export async function GET(request: NextRequest) {
  const ctx = await adminClient(request);
  if (ctx.denied) return ctx.denied;

  const [{ data: usersData }, businesses] = await Promise.all([
    ctx.admin.auth.admin.listUsers({ page: 1, perPage: 500 }),
    GuakiDataService.getAllBusinesses(),
  ]);
  const fichasPorOwner = new Map<string, number>();
  for (const b of businesses) {
    const owner = (b as { ownerId?: string }).ownerId;
    if (owner) fichasPorOwner.set(owner, (fichasPorOwner.get(owner) || 0) + 1);
  }
  const users = (usersData?.users || []).map((u) => ({
    id: u.id,
    email: u.email,
    role: u.app_metadata?.role || 'sin-rol',
    name: u.user_metadata?.fullName || u.user_metadata?.name || '',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at || null,
    banned_until: u.banned_until || null,
    fichas: fichasPorOwner.get(u.id) || 0,
  }));
  return NextResponse.json({ ok: true, users }, { headers: { 'Cache-Control': 'no-store, private' } });
}

export async function POST(request: NextRequest) {
  const ctx = await adminClient(request);
  if (ctx.denied) return ctx.denied;

  let body: { user_id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }
  const { user_id, action } = body;
  if (!user_id || !['ban', 'unban'].includes(String(action))) {
    return NextResponse.json({ error: 'SE_REQUIERE user_id Y action ban|unban' }, { status: 400 });
  }
  if (user_id === ctx.actorId) {
    return NextResponse.json({ error: 'NO_PUEDES_SUSPENDERTE_A_TI_MISMO' }, { status: 422 });
  }

  const { error } = await ctx.admin.auth.admin.updateUserById(user_id, {
    ban_duration: action === 'ban' ? '43830h' : 'none', // ~5 anos vs desban
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  await GuakiDataService.recordEvent('admin_action', {
    action,
    target: 'usuario',
    target_id: user_id,
    actor_id: ctx.actorId,
    origen: 'admin-panel',
  });
  return NextResponse.json({ ok: true, user_id, action });
}
