import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured, GuakiDataService } from '@/lib/supabase';
import { getTrustedRole, isAuthorizationFailure } from '@/lib/authorization';

export const dynamic = 'force-dynamic';

async function resolveActor(request: NextRequest) {
  const token = request.cookies.get('guaki_session')?.value;
  if (!token) return { error: 'AUTH_REQUIRED', status: 401 as const };
  if (!isSupabaseConfigured()) return { error: 'AUTH_PROVIDER_NOT_CONFIGURED', status: 503 as const };
  const { data, error } = await getSupabaseClient().auth.getUser(token);
  if (error || !data.user) return { error: 'SESSION_INVALID', status: 401 as const };
  const role = getTrustedRole(data.user);
  if (role !== 'provider') return { error: 'PROVIDER_REQUIRED', status: 403 as const };
  // H-12 FIX (audit v2): identity email must come from the verified session, never the body.
  const accountEmail = (data.user.email || '').trim().toLowerCase();
  if (!accountEmail) return { error: 'VERIFIED_EMAIL_REQUIRED', status: 403 as const };
  return {
    token,
    actor: {
      userId: data.user.id,
      email: accountEmail,
      role,
    },
  };
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const resolved = await resolveActor(request);
  if ('error' in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  if (resolved.token && isSupabaseConfigured()) {
    try {
      const business = await GuakiDataService.claimBusinessWithToken(params.id, resolved.token, resolved.actor.email);
      return NextResponse.json({ success: true, business, next: 'IN_AUDIT', persistence: 'supabase' }, { status: 200 });
    } catch (error) {
      const candidate = error as { code?: string; message?: string };
      const message = error instanceof Error ? error.message : candidate?.message || candidate?.code || '';
      const forbidden = isAuthorizationFailure(error);
      const status = forbidden ? 403 : message.includes('ALREADY_CLAIMED') || message.includes('NOT_FOUND') ? 409 : 500;
      return NextResponse.json({ error: 'BUSINESS_CLAIM_FAILED', code: message || 'CLAIM_ERROR' }, { status });
    }
  }

  return NextResponse.json({ error: 'AUTH_PROVIDER_NOT_CONFIGURED' }, { status: 503 });
}
