import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTrustedRole } from './lib/authorization';

function loginRedirect(request: NextRequest, status: 401 | 403 = 401, error: string = 'AUTH_REQUIRED'): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error }, { status });
  }
  const loginUrl = request.nextUrl.clone();
  // Preserva el destino original (ej. /provider/dashboard?claim=GKI-...) para
  // continuar el flujo después del login.
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl);
}

// 🚫 148. Detección perimetral de ataques (SQLi, XSS, Path Traversal)
const THREAT_REGEX = /(\.\.\/|\.\.\\|union\s+select|or\s+1=1|information_schema|<script|%3cscript|onerror\s*=|onload\s*=|javascript:|data:text\/html|wp-login|wp-admin|\.env|\.git|__proto__|etc\/passwd)/i;

// Next entrega path/search ya percent-encoded: se evalúa también la versión
// decodificada para cubrir payloads como `?x=onerror%3D1` o `javascript%3A`.
function containsThreat(value: string): boolean {
  if (THREAT_REGEX.test(value)) return true;
  try {
    return THREAT_REGEX.test(decodeURIComponent(value));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  // C-02 FIX: Use server-side env var instead of spoofable Host header for security boundaries.
  const isLocal = process.env.NODE_ENV !== 'production';

  // 148. Bloqueo de amenazas perimetrales
  if (containsThreat(`${path}${search}`)) {
    return new NextResponse('Acceso denegado por seguridad perimetral Guaki.', { status: 403 });
  }

  // 🛡️ Bloqueo de Command Center en producción pública (Exclusivo para localhost / uso local del fundador)
  if (path.startsWith('/command-center') || path.startsWith('/api/command-center')) {
    if (!isLocal) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  // 🛡️ Rutas de diagnóstico de infraestructura: solo local.
  // Exponen metadata interna (keys presentes, pool, IPs, errores) — nunca públicas.
  if (path.startsWith('/api/debug')) {
    if (!isLocal) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  // 141 & 71. Edge Geolocation por IP en Vercel
  const city = request.headers.get('x-vercel-ip-city') || (isLocal ? 'Medellín' : '');
  const country = request.headers.get('x-vercel-ip-country') || (isLocal ? 'CO' : '');
  const latitude = request.headers.get('x-vercel-ip-latitude') || '';
  const longitude = request.headers.get('x-vercel-ip-longitude') || '';

  const requestHeaders = new Headers(request.headers);
  if (city) requestHeaders.set('x-guaki-detected-city', decodeURIComponent(city));
  if (country) requestHeaders.set('x-guaki-detected-country', country);
  if (latitude) requestHeaders.set('x-guaki-detected-lat', latitude);
  if (longitude) requestHeaders.set('x-guaki-detected-lng', longitude);

  // Rutas públicas: inyectar geolocalización y continuar
  const isProtectedPage = path.startsWith('/admin') || path.startsWith('/provider') || path.startsWith('/mi-negocio');
  const isProtectedApi = path.startsWith('/api/admin');
  if (!isProtectedPage && !isProtectedApi) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    if (city && !request.cookies.get('guaki_geo_city')) {
      response.cookies.set('guaki_geo_city', decodeURIComponent(city), { path: '/', maxAge: 86400 * 7 });
    }
    return response;
  }

  const token = request.cookies.get('guaki_session')?.value;

  // Las rutas protegidas siempre requieren una sesión Supabase real, también en local.
  if (!token) {
    return loginRedirect(request, 401, 'AUTH_REQUIRED');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || anonKey === 'your-anon-key-here') {
    return loginRedirect(request, 503 as any, 'AUTH_PROVIDER_NOT_CONFIGURED');
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return loginRedirect(request, 401, 'SESSION_INVALID');

    const role = getTrustedRole(data.user);
    if ((path.startsWith('/admin') || path.startsWith('/api/admin')) && role !== 'admin') {
      return loginRedirect(request, 403, 'ADMIN_REQUIRED');
    }
    if (path.startsWith('/provider') && role === 'client') {
      return loginRedirect(request, 403, 'PROVIDER_REQUIRED');
    }
    if (path.startsWith('/mi-negocio') && role === 'client') {
      return loginRedirect(request, 403, 'PROVIDER_REQUIRED');
    }
  } catch {
    return loginRedirect(request, 401, 'AUTH_VERIFICATION_FAILED');
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
