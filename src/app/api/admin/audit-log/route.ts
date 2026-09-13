export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('guaki_session')?.value;
  if (!isSupabaseConfigured() || !token || token.startsWith('dev-') || token.startsWith('usr_local_')) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
  }
  const { data: actor, error } = await getSupabaseClient().auth.getUser(token);
  if (error || actor.user?.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceKey) return NextResponse.json({ ok: false, entries: [] });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error: qErr } = await admin
    .from('events')
    .select('id,event_name,metadata,timestamp,business_id')
    .eq('event_name', 'admin_action')
    .order('timestamp', { ascending: false })
    .limit(60);

  return NextResponse.json(
    { ok: !qErr, entries: data || [], error: qErr?.message },
    { headers: { 'Cache-Control': 'no-store, private' } },
  );
}
