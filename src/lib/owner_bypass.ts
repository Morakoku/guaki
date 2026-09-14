// ⚙️ Acceso temporal del dueño (backdoor REVOCABLE).
// Botón oculto al pie de la web + código compartido (env ADMIN_BYPASS_TOKEN).
// Stateless: cookie = `ts.rando<hmac>` firmada con HMAC-SHA256 del secreto de env.
// Revocable: si ADMIN_BYPASS_TOKEN no está definido, todo verifica false.
// ⚠️ Mientras exista, debilita la seguridad del panel: retíralo al configurar un admin real.

const encoder = new TextEncoder();

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bufToHex(await crypto.subtle.sign('HMAC', key, encoder.encode(msg)));
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function ownerBypassEnabled(): boolean {
  return Boolean(process.env.ADMIN_BYPASS_TOKEN?.trim());
}

const TTL_MS = 12 * 3600 * 1000; // 12 horas

export async function signOwnerBypassCookie(): Promise<string | null> {
  const secret = process.env.ADMIN_BYPASS_TOKEN?.trim();
  if (!secret) return null;
  const msg = `${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`;
  return `${msg}.${await hmacHex(secret, msg)}`;
}

export async function verifyOwnerBypassCookie(cookie: string | undefined | null): Promise<boolean> {
  const secret = process.env.ADMIN_BYPASS_TOKEN?.trim();
  if (!secret || !cookie) return false;
  const parts = cookie.split('.');
  if (parts.length !== 3) return false;
  const [ts, rand, mac] = parts;
  if (!ts || !rand || !mac) return false;
  const tsNum = Number.parseInt(ts, 36);
  if (!Number.isFinite(tsNum)) return false;
  const now = Date.now();
  if (tsNum > now + 60_000 || now - tsNum > TTL_MS) return false;
  const expected = await hmacHex(secret, `${ts}.${rand}`);
  return constantTimeEqualHex(expected, mac);
}

export async function verifyOwnerBypassCode(code: string): Promise<boolean> {
  const secret = process.env.ADMIN_BYPASS_TOKEN?.trim();
  if (!secret || !code) return false;
  const a = await hmacHex(secret, 'code:' + code);
  const b = await hmacHex(secret, 'code:' + secret);
  return constantTimeEqualHex(a, b);
}