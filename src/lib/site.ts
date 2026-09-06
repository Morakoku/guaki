const PRODUCTION_SITE_URL_ERROR =
  'SITE_URL_REQUIRED_IN_PRODUCTION: set a non-localhost HTTPS NEXT_PUBLIC_SITE_URL or VERCEL_URL';

function isLocalhost(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();
  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '0.0.0.0' ||
    normalizedHostname === '[::1]'
  );
}

function normalizeProductionSiteUrl(value: string): string | null {
  try {
    const candidate = value.includes('://') ? value : `https://${value}`;
    const url = new URL(candidate);

    if (url.protocol !== 'https:' || !url.hostname || isLocalhost(url.hostname) || url.username || url.password) {
      return null;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function resolveSiteUrl(env: NodeJS.ProcessEnv = process.env) {
  const configuredUrl = env.NEXT_PUBLIC_SITE_URL?.trim();

  if (env.NODE_ENV === 'production') {
    for (const candidate of [configuredUrl, env.VERCEL_URL?.trim()]) {
      if (!candidate) continue;
      const safeUrl = normalizeProductionSiteUrl(candidate);
      if (safeUrl) return safeUrl;
    }

    throw new Error(PRODUCTION_SITE_URL_ERROR);
  }

  if (configuredUrl) return configuredUrl.replace(/\/$/, '');
  return 'http://localhost:3100';
}

export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path: string = '/') {
  const normalizedPath = path === '/' ? '' : `/${path.replace(/^\/+/, '')}`;
  return `${SITE_URL}${normalizedPath || '/'}`;
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
