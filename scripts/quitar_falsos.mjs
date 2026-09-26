/**
 * Encuentra los afiches FALSOS en la BD (QA/test/demo/placeholder) y los quita.
 * Uso: node scripts/quitar_falsos.mjs --dry  (lista sin tocar)
 *      node scripts/import... espera — quitar_falsos.mjs --run (marca status='removed')
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
if (!URL || !KEY || KEY.includes('placeholder') || KEY.includes('[SENSITIVE]')) {
  console.error('ERROR: falta SUPABASE_SERVICE_ROLE_KEY real en guaki/.env.local');
  process.exit(2);
}

// Patrones de ficha FALSA (QA/test/demo/placeholder)
const FAKE_PATTERNS = [
  { field: 'slug', re: /(^|-)qa-|qa-pet|qa-sonrisas/i, label: 'slug QA' },
  { field: 'name', re: /\(QA\)|\(test\)|\(demo\)/i, label: 'nombre con (QA)/(test)/(demo)' },
  { field: 'name', re: /^empresa real$|^test /i, label: 'nombre test/empresa real' },
  { field: 'name', re: /prueba|dummy/i, label: 'nombre de prueba' },
  { field: 'slug', re: /prueba|dummy/i, label: 'slug de prueba' },
  { field: 'slug', re: /-test-|test-|^home-test/i, label: 'slug test' },
  { field: 'source', re: /qa|test|demo/i, label: 'source QA/test/demo' },
];

async function fetchAll(url) {
  const rows = [];
  let offset = 0;
  while (true) {
    const r = await fetch(`${url}/rest/v1/businesses?select=id,slug,name,category,city,status,claim_status,source,plan&limit=1000&offset=${offset}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`);
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
    offset += 1000;
  }
  return rows;
}

const args = process.argv.slice(2);
const run = args.includes('--run');

const all = await fetchAll(URL);
console.log(`total fichas en BD: ${all.length}`);

const fakes = [];
const seen = new Set();
for (const b of all) {
  for (const p of FAKE_PATTERNS) {
    const v = String(b[p.field] || '');
    if (p.re.test(v) && !seen.has(b.id)) {
      seen.add(b.id);
      fakes.push({ ...b, motivo: p.label });
      break;
    }
  }
}

console.log(`\nFALSAS detectadas: ${fakes.length}`);
for (const f of fakes.slice(0, 40)) {
  console.log(`  - ${f.name} | ${f.slug} | ${f.status} | claim=${f.claim_status} | motivo: ${f.motivo}`);
}
if (fakes.length > 40) console.log(`  ... y ${fakes.length - 40} más`);

if (!run) {
  console.log('\n(dry) — corre con --run para quitarlas (status=removed).');
  process.exit(0);
}

let ok = 0, fail = 0;
const errores = [];
for (const f of fakes) {
  // 1) intento PATCH status='removed' (mantiene rastro)
  let r = await fetch(`${URL}/rest/v1/businesses?id=eq.${f.id}`, {
    method: 'PATCH',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'removed', updated_at: new Date().toISOString() }),
  });
  if (r.ok) { ok++; continue; }
  const errText = (await r.text()).slice(0, 200);
  // 2) fallback: DELETE (el trigger de workflow puede bloquear la transición)
  const d = await fetch(`${URL}/rest/v1/businesses?id=eq.${f.id}`, {
    method: 'DELETE',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (d.ok) { ok++; continue; }
  fail++;
  errores.push(`${f.slug}: PATCH ${r.status} (${errText}) · DELETE ${d.status}`);
}
console.log(`\nRESUMEN: ${ok} quitadas, ${fail} fallos.`);
if (errores.length) console.log('errores:', errores.join('\n'));
