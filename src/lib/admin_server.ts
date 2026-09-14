import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export type AdminContext = { denied: NextResponse } | { admin: SupabaseClient; actorId: string };

export async function adminClient(request: NextRequest): Promise<AdminContext> {
  const token = request.cookies.get('guaki_session')?.value;
  if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
    return { denied: NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 }) };
  }
  const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
  if (error || actor.user?.app_metadata?.role !== 'admin') {
    return { denied: NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 }) };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceKey) {
    return { denied: NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 }) };
  }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  return { admin, actorId: actor.user.id };
}

export function sanitizeFilter(value: string): string {
  return value.replace(/[%,()]/g, ' ').trim();
}

export async function recordAdminEvent(
  admin: SupabaseClient,
  actorId: string,
  eventName: string,
  metadata: Record<string, unknown>,
  businessId: string | null = null,
): Promise<void> {
  const { error } = await admin.from('events').insert({
    event_name: eventName,
    business_id: businessId,
    actor_user_id: actorId,
    metadata,
  });
  if (error) {
    console.error('[admin] event log failed:', eventName, error.message);
  }
}
