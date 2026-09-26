// Verificación end-to-end del Bloque 1 (trigger H-2 + columnas promo).
// Node (nunca PowerShell: Supabase rechaza sb_secret con User-Agent browser).
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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

(async () => {
  // 1) Las columnas de promo existen
  const r = await fetch(`${URL}/rest/v1/businesses?select=id,slug,plan,plan_source,plan_expires_at&limit=2`, { headers: H });
  console.log('1) columnas plan_source/plan_expires_at:', r.status === 200 ? 'EXISTEN ✓' : `FALLO ${r.status}`);
  const rows = await r.json().catch(() => []);
  if (rows.length) console.log('   muestra:', JSON.stringify(rows[0]));

  // 2) El trigger H-2: intentar cambiar rating de una ficha (debe RECHAZAR)
  if (rows.length) {
    const test = rows[0];
    const p = await fetch(`${URL}/rest/v1/businesses?id=eq.${test.id}`, {
      method: 'PATCH', headers: H,
      body: JSON.stringify({ rating: 5.0 }),
    });
    const t = await p.text();
    const blocked = p.status >= 400 && (t.includes('PROTECTED_BUSINESS_FIELDS') || t.includes('PROTECTED'));
    console.log(`2) H-2: PATCH rating (debe rechazarse): ${blocked ? 'BLOQUEADO ✓' : `⚠️ PASÓ (HTTP ${p.status}) — el dueño podría editar el rating`}`);
    if (!blocked) console.log('   detalle:', t.slice(0, 200));
  }

  // 3) La promo: contar concesiones actuales
  const pr = await fetch(`${URL}/rest/v1/businesses?plan_source=eq.launch_promo&select=id&limit=1`, { headers: H });
  const promoRows = await pr.json().catch(() => []);
  console.log(`3) concesiones launch_promo hasta ahora: ${promoRows.length === 0 ? '0 (cupo intacto ✓)' : '≥1'}`);
  console.log('\nVERIFICACIÓN COMPLETA');
})();
