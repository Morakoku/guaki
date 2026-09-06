export type TrustedRole = 'client' | 'provider' | 'admin';

type AuthUserClaims = {
  app_metadata?: Record<string, unknown>;
};

const trustedRoles = new Set<TrustedRole>(['client', 'provider', 'admin']);

export function getTrustedRole(user: AuthUserClaims): TrustedRole {
  const role = user.app_metadata?.role;
  return typeof role === 'string' && trustedRoles.has(role as TrustedRole)
    ? role as TrustedRole
    : 'client';
}

export function isAuthorizationFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; status?: number; statusCode?: number; message?: string };
  return candidate.status === 401 || candidate.status === 403 || candidate.statusCode === 401 || candidate.statusCode === 403
    || candidate.code === '42501'
    || /row-level security|permission denied|not authorized|unauthorized|forbidden/i.test(candidate.message || '');
}
