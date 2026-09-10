export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { getTrustedRole } from '@/lib/authorization';

/**
 * Asigna el rol 'provider' a un usuario autenticado con sesión validada.
 * Necesario porque el registro (signUp con anon key) no puede escribir
 * app_metadata y el middleware exige rol 'provider' para /provider y /mi-negocio.
 */
export async function POST(request: NextRequest) {
  const bearer = request.headers.get('authorization') ?? '';
  const accessToken = bearer.replace(/^Bearer\s+/i, '').trim();
  if (!accessToken) {
    return NextResponse.json({ error: 'ACCESS_TOKEN_REQUIRED' }, { status: 400 });
  }

  let userId = '';
  let currentRole: ReturnType<typeof getTrustedRole> = 'client';
  try {
    const { data, error } = await getSupabaseClient().auth.getUser(accessToken);
    if (error || !data.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
    userId = data.user.id;
    currentRole = getTrustedRole(data.user);
  } catch {
    return NextResponse.json({ error: 'AUTH_PROVIDER_UNAVAILABLE' }, { status: 503 });
  }

  if (currentRole === 'provider' || currentRole === 'admin') {
    return NextResponse.json({ ok: true, role: currentRole });
  }

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SERVICE_ROLE_KEY?.trim() || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';

  if (!serviceKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co/.test(supabaseUrl)) {
    return NextResponse.json(
      { error: 'PROVISIONING_NOT_CONFIGURED', role: currentRole },
      { status: 503 }
    );
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { error } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: { role: 'provider' },
    });
    if (error) {
      return NextResponse.json({ error: 'PROVISIONING_FAILED' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, role: 'provider' });
  } catch {
    return NextResponse.json({ error: 'PROVISIONING_UNAVAILABLE' }, { status: 503 });
  }
}
