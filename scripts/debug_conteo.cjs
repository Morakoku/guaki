// Debug del conteo del movimiento_diario — qué devuelve PostgREST realmente.
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
const env = {
  ...loadEnvFile(path.join(__dirname, '..', '.env.local')),
  ...loadEnvFile('C:\\Users\\edwin\\Documents\\Trinidad\\mapache\\backend\\.env'),
  ...process.env,
};
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
console.log('URL efectiva:', URL);
console.log('KEY efectiva (prefijo):', KEY.slice(0, 20) + '... (longitud ' + KEY.length + ')');
console.log('KEY es legacy JWT:', KEY.startsWith('eyJ'));

(async () => {
  const r = await fetch(`${URL}/rest/v1/businesses?select=id&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  console.log('\nstatus:', r.status);
  console.log('content-range:', JSON.stringify(r.headers.get('content-range')));
  const body = await r.json();
  console.log('rows:', body.length);
})();
