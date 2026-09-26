// Bloque 1 #9 — settings de la promo de apertura en platform_settings.
// Node (nunca PowerShell: Supabase rechaza secret keys con User-Agent browser).
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
function loadEnvFile(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const [k, ...rest] = t.split('=');
    out[k.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
  return out;
}
const env = { ...loadEnvFile('.env.local'), ...process.env };
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

(async () => {
  // 1) introspección: estructura de platform_settings
  const r = await fetch(`${URL}/rest/v1/platform_settings?limit=2`, { headers: H });
  console.log('GET platform_settings:', r.status);
  const rows = await r.json().catch(() => []);
  if (rows.length) console.log('estructura:', JSON.stringify(rows[0]).slice(0, 400));

  // 2) upsert de la promo — la tabla usa `key` + `value` (JSONB), patrón de la fila 'pricing'
  const up = await fetch(`${URL}/rest/v1/platform_settings?on_conflict=key`, {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      key: 'launch_promo',
      value: {
        active: true,
        limit: 100,
        grantMonths: 12,
        label: 'GRATIS — apertura (primeras 100 fichas)',
      },
    }),
  });
  console.log('upsert launch_promo:', up.status);
  if (!up.ok) console.log('  detalle:', (await up.text()).slice(0, 300));
  else {
    const [row] = await up.json().catch(() => [null]);
    console.log('  fila:', JSON.stringify(row).slice(0, 300));
  }
  console.log('LISTO — promo settings aplicadas');
})();
