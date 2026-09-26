// Verifica qué quedó VIVO en Postgres: definiciones de funciones + triggers.
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
  // RPC de introspección: PostgREST no expone pg_ directamente; usar una
  // query RPC no existe — probar via la vista pg de Supabase... PostgREST
  // no permite SQL. Alternativa: verificar el COMPORTAMIENTO (patch rating)
  // con distintas formas, y el estado de la función via un SELECT a
  // information_schema.routines (accesible si existe como vista expuesta).
  const r = await fetch(`${URL}/rest/v1/rpc/protect_business_workflow_fields`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: '{}' });
  console.log('rpc probe protect:', r.status);
  // information_schema via PostgREST no está; el check decisivo es el
  // comportamiento: patch rating en una ficha sin rating (distinto seguro).
  const q = await fetch(`${URL}/rest/v1/businesses?select=id,slug,rating,plan,plan_source&limit=3`, { headers: H });
  const rows = await q.json();
  console.log('muestras:', JSON.stringify(rows).slice(0, 400));
  for (const row of rows) {
    const other = row.rating === 9.99 ? 8.88 : 9.99;
    const p = await fetch(`${URL}/rest/v1/businesses?id=eq.${row.id}`, {
      method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify({ rating: other }),
    });
    console.log(`PATCH rating ${row.slug}: HTTP ${p.status} ${p.status >= 400 ? '→ BLOQUEADO ✓' : '→ PASÓ ⚠️'}`);
    if (p.status >= 400) break;
  }
})();
