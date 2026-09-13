export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

function tokenOk(header: string | null): boolean {
  const expected = (process.env.TORRE_SHARED_TOKEN || '').trim();
  if (!expected || !header) return false;
  const a = Buffer.from(header.slice(0, 256));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!tokenOk(request.headers.get('x-torre-token'))) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: 'NOT_CONFIGURED' }, { status: 503 });
  }
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const [auditRes, recentRes] = await Promise.all([
    admin
      .from('businesses')
      .select('id,name,slug,city,category,status,claim_status,owner_email,updated_at')
      .eq('status', 'in_audit')
      .order('updated_at', { ascending: true })
      .limit(50),
    admin
      .from('businesses')
      .select('id,name,slug,city,category,status,claim_status,updated_at')
      .in('status', ['published', 'approved', 'rejected'])
      .order('updated_at', { ascending: false })
      .limit(15),
  ]);

  return NextResponse.json({
    ok: true,
    en_auditoria: auditRes.data || [],
    recientes: recentRes.data || [],
    errores: [auditRes.error?.message, recentRes.error?.message].filter(Boolean),
  });
}
