// Verifica si la tabla `licenses` (VEYRA AGENTE) existe en Supabase.
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
const env = { ...loadEnvFile(path.join(__dirname, '..', '.env.local')), ...process.env };
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

(async () => {
  const r = await fetch(`${URL}/rest/v1/licenses?select=key,status,plan,hwid&limit=5`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  console.log('tabla licenses:', r.status === 200 ? 'EXISTE' : `NO EXISTE (HTTP ${r.status})`);
  if (r.ok) {
    const rows = await r.json();
    console.log('llaves registradas:', JSON.stringify(rows));
  } else {
    console.log('detalle:', (await r.text()).slice(0, 200));
  }
})();
