/**
 * Quita UNA ficha cuando el propietario dice que NO (workflow 2026-09-23).
 * Uso: node scripts/quitar_ficha.mjs --slug xiluet-cirugia-plastica
 *      node scripts/quitar_ficha.mjs --phone 584165474447
 * El bot la ejecuta vía terminal cuando un lead dice "no quiero / quítame".
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

const args = process.argv.slice(2);
const slugIdx = args.indexOf('--slug');
const phoneIdx = args.indexOf('--phone');

if (slugIdx < 0 && phoneIdx < 0) {
  console.error('uso: node quitar_ficha.mjs --slug <slug> | --phone <numero-e164-sin-+>');
  process.exit(2);
}

let query = '';
let label = '';
if (slugIdx >= 0) {
  query = `slug=eq.${encodeURIComponent(args[slugIdx + 1])}`;
  label = args[slugIdx + 1];
} else {
  const phone = args[phoneIdx + 1].replace(/\D/g, '');
  // El teléfono puede estar en phone o whatsapp con prefijo; match por sufijo.
  query = `or=(phone.ilike.*${phone}*,whatsapp.ilike.*${phone}*)`;
  label = phone;
}

// Buscar la ficha
const q = await fetch(`${URL}/rest/v1/businesses?${query}&select=id,slug,name,phone,status,claim_status&limit=5`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (!q.ok) {
  console.error(`busqueda fallo: HTTP ${q.status}`);
  process.exit(1);
}
const rows = await q.json();
if (!rows.length) {
  console.log(`SIN FICHA para ${label} — nada que quitar.`);
  process.exit(0);
}
console.log(`fichas encontradas para ${label}: ${rows.length}`);
for (const r of rows) console.log(`  - ${r.name} | ${r.slug} | ${r.status}`);

// Quitar (DELETE — el trigger bloquea transiciones de status)
let ok = 0, fail = 0;
for (const r of rows) {
  const d = await fetch(`${URL}/rest/v1/businesses?id=eq.${r.id}`, {
    method: 'DELETE',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (d.ok) ok++; else fail++;
}
console.log(`RESULTADO: ${ok} ficha(s) quitada(s), ${fail} fallos.`);
