export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

function blocked(message: string, status = 400) {
  return NextResponse.json({ status: 'BLOCKED', message }, { status });
}

function safeMapacheUrl(): string | null {
  try {
    const url = new URL(MAPACHE_API);
    return url.hostname === '127.0.0.1' ? url.toString().replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const api = safeMapacheUrl();
  if (!api) return blocked('Solo se permite conectar Mapache en localhost.', 503);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return blocked('El formulario de correo no tiene un JSON valido.');
  }

  if (typeof payload.email !== 'string' || !payload.email.trim()) {
    return blocked('Falta el correo del buzon.');
  }
  if (typeof payload.smtp_password !== 'string' || !payload.smtp_password) {
    return blocked('Escribe la contrasena del buzon directamente en este formulario.');
  }

  try {
    const accountsResponse = await fetch(`${api}/api/v1/settings/email-accounts`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const accounts = await accountsResponse.json().catch(() => []) as Array<{ id?: string; email?: string }>;
    const existing = accountsResponse.ok
      ? accounts.find((account) => account.email?.toLowerCase() === String(payload.email).trim().toLowerCase())
      : undefined;
    const accountUrl = existing?.id
      ? `${api}/api/v1/settings/email-accounts/${encodeURIComponent(existing.id)}/smtp`
      : `${api}/api/v1/settings/email-accounts/smtp`;
    const createdResponse = await fetch(accountUrl, {
      method: existing?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const created = await createdResponse.json().catch(() => null) as { id?: string; email?: string } | null;
    if (!createdResponse.ok || !created?.id) {
      return blocked('Mapache no pudo guardar las credenciales del buzon. Revisa los datos y vuelve a intentar.', createdResponse.status || 502);
    }

    const verifiedResponse = await fetch(`${api}/api/v1/settings/email-accounts/${encodeURIComponent(created.id)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const verified = await verifiedResponse.json().catch(() => null) as { status?: string; email?: string } | null;
    if (!verifiedResponse.ok || verified?.status !== 'ACTIVE') {
      return NextResponse.json({
        status: 'BLOCKED',
        accountId: created.id,
        accountStatus: verified?.status ?? 'ERROR',
        message: 'La cuenta se registro, pero la autenticacion SMTP no paso. No se habilito ningun envio.',
      }, { status: 422 });
    }

    return NextResponse.json({
      status: 'PASS',
      accountId: created.id,
      accountStatus: 'ACTIVE',
      email: verified.email ?? created.email ?? payload.email,
      message: 'Buzon conectado y autenticado. El envio sigue bloqueado en modo borrador.',
    });
  } catch {
    return blocked('Mapache no responde en localhost; no se modifico el estado de produccion.', 502);
  }
}
