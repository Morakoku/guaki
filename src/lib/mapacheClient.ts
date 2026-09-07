/**
 * Mapache Service Token Generator
 * 
 * Generates HMAC-SHA256 signed bearer tokens for Guaki → Mapache API calls.
 * Format: Bearer <client_id>.<timestamp>.<nonce>.<signature>
 * Signature: HMAC-SHA256(key, "client_id.timestamp.nonce")
 */

const CLIENT_ID = 'guaki';

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return toHex(signature);
}

/**
 * Generate a service token for authenticating with Mapache API.
 * Requires MAPACHE_SERVICE_TOKEN_KEY environment variable.
 */
export async function generateMapacheToken(): Promise<string> {
  const key = process.env.MAPACHE_SERVICE_TOKEN_KEY;
  if (!key) {
    throw new Error('MAPACHE_SERVICE_TOKEN_KEY is not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const message = `${CLIENT_ID}.${timestamp}.${nonce}`;
  const signature = await hmacSha256(key, message);

  return `${CLIENT_ID}.${timestamp}.${nonce}.${signature}`;
}

/**
 * Get the Mapache API base URL from environment.
 */
export function getMapacheApiUrl(): string {
  return (process.env.NEXT_PUBLIC_MAPACHE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
}

/**
 * Make an authenticated request to the Mapache API.
 */
export async function mapacheFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const token = await generateMapacheToken();
  const url = `${getMapacheApiUrl()}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({})) as T;
  return { ok: response.ok, status: response.status, data };
}
