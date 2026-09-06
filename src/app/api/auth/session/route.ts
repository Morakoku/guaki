export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getTrustedRole } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('guaki_session')?.value;
  if (!token) return NextResponse.json({ error: 'SESSION_REQUIRED' }, { status: 401 });
  try {
    const { data, error } = await getSupabaseClient().auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email || '',
        fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuario',
        role: getTrustedRole(data.user),
      },
    });
  } catch {
    return NextResponse.json({ error: 'AUTH_PROVIDER_UNAVAILABLE' }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('guaki_session', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { accessToken?: unknown } | null;
  const accessToken = typeof body?.accessToken === 'string' ? body.accessToken : '';
  if (!accessToken) return NextResponse.json({ error: 'ACCESS_TOKEN_REQUIRED' }, { status: 400 });

  let data;
  let error;
  try {
    ({ data, error } = await getSupabaseClient().auth.getUser(accessToken));
  } catch (cause) {
    const code = cause instanceof Error ? cause.message : 'GUAKI_AUTH_UNAVAILABLE';
    if (code === 'GUAKI_SUPABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'AUTH_PROVIDER_NOT_CONFIGURED' }, { status: 503 });
    }
    throw cause;
  }

  if (error || !data?.user) return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set('guaki_session', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}
