// Verifica la fila de XILUET: ¿los datos enriquecidos están en la BD?
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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

(async () => {
  const r = await fetch(`${URL}/rest/v1/businesses?slug=eq.xiluet-cirugia-plastica&select=id,slug,name,category,schedule,services,images,plan,status,claim_status&limit=1`, { headers: H });
  console.log('status:', r.status);
  const [row] = await r.json().catch(() => []);
  if (!row) { console.log('FICHA NO ENCONTRADA'); return; }
  console.log('name:', row.name);
  console.log('category:', row.category);
  console.log('plan:', row.plan, '| status:', row.status, '| claim:', row.claim_status);
  console.log('schedule:', JSON.stringify(row.schedule).slice(0, 200));
  console.log('services:', JSON.stringify(row.services).slice(0, 200));
  console.log('images:', JSON.stringify(row.images).slice(0, 200));
})();
