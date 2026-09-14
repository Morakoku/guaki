export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { ownerBypassEnabled, signOwnerBypassCookie, verifyOwnerBypassCode } from '@/lib/owner_bypass';

export async function POST(request: NextRequest) {
  if (!ownerBypassEnabled()) {
    return NextResponse.json({ error: 'OWNER_BYPASS_DISABLED' }, { status: 503 });
  }
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const code = String(body.code || '');
  if (!code || !(await verifyOwnerBypassCode(code))) {
    return NextResponse.json({ error: 'INVALID_CODE' }, { status: 403 });
  }
  const cookie = await signOwnerBypassCookie();
  if (!cookie) {
    return NextResponse.json({ error: 'OWNER_BYPASS_DISABLED' }, { status: 503 });
  }
  const response = NextResponse.json({ ok: true, next: '/admin/dashboard' });
  response.cookies.set('guaki_admin_bypass', cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 3600,
  });
  return response;
}