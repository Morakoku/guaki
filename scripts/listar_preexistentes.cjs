// Lista los afiches pre-existentes (no import) para identificar los falsos.
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
  const r = await fetch(`${URL}/rest/v1/businesses?select=id,slug,name,category,city,status,claim_status,plan,source&source=neq.import-master-guaki-2026-09-23&limit=100`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const rows = await r.json();
  console.log('pre-existentes (no import):', rows.length);
  for (const b of rows) {
    console.log(`  - ${b.name || ''} | ${b.slug} | ${b.status} | claim=${b.claim_status} | plan=${b.plan} | ${b.city || ''}`);
  }
})();
