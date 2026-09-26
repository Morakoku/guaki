/**
 * Import de leads GUAKI → tabla `businesses` de Supabase (fichas pre-creadas).
 * Funnel "Tu Afiche Aquí" (2026-09-23): cada lead obtiene su ficha publicada
 * con claim_status='unclaimed' — el email lo lleva a SU ficha, confirma su
 * WhatsApp y reclama.
 *
 * Uso:
 *   node scripts/import_leads_guaki.mjs --dry 3     # prueba sin escribir
 *   node scripts/import_leads_guaki.mjs --run 3     # importa 3 reales
 *   node scripts/import_leads_guaki.mjs --run       # importa TODO el master
 *
 * Requiere: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY de GUAKI en el entorno
 * (o en guaki/.env.local). La key pégala desde el dashboard de Supabase
 * (Settings → API → service_role).
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER = 'D:\\Proyectos IA\\01_PROYECTOS\\GUAKI\\prospeccion\\guaki_master_leads.json';

// ---- env ----
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
  ...process.env,
};
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY || KEY.includes('placeholder') || KEY.includes('[SENSITIVE]')) {
  console.error('ERROR: falta SUPABASE_SERVICE_ROLE_KEY real de GUAKI.');
  console.error('  Pégala en guaki/.env.local (Settings → API del dashboard Supabase)');
  process.exit(2);
}

// ---- helpers ----
const slugify = (s) => (s || 'negocio').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const cleanName = (n) => (n || '')
  .replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').replace(/\s+(s\.?a\.?s?|ltda?|cia\.?|inc)\.?\s*$/i, '').trim();

const HOOKS = [
  [['cirugia', 'cirurg', 'plast'], 'cirugía estética'],
  [['barber'], 'barbería'],
  [['salon', 'salón', 'belleza', 'peluquer'], 'salón de belleza'],
  [['odont', 'dental'], 'clínica odontológica'],
  [['tatu'], 'estudio de tatuajes'],
  [['unas', 'nail'], 'salón de uñas'],
  [['gimnas', 'fitness', 'crossfit', 'box'], 'gimnasio'],
  [['spa', 'estetic', 'estétic'], 'spa y centro de estética'],
  [['inmobil', 'real estate', 'fincaraiz', 'finca ra'], 'inmobiliaria'],
];
const FALLBACK_CAT = 'negocio local';

function realCategory(lead) {
  const q = ((lead.query || '') + ' ' + (lead.name || '')).toLowerCase();
  for (const [keys, cat] of HOOKS) {
    if (keys.some((k) => q.includes(k))) return cat;
  }
  return FALLBACK_CAT;
}

const SERVICES_BY_CAT = {
  'clínica odontológica': ['Consulta general', 'Limpieza', 'Ortodoncia', 'Blanqueamiento'],
  'clínica dental': ['Consulta', 'Limpieza', 'Diseño de sonrisa'],
  'salón de belleza': ['Corte y estilo', 'Color', 'Peinados para eventos'],
  'salón de uñas': ['Manicure', 'Pedicure', 'Uñas acrílicas', 'Nail art'],
  'spa y centro de estética': ['Masaje relajante', 'Facial', 'Tratamientos corporales'],
  'estudio de tatuajes': ['Tatuaje personalizado', 'Diseño a medida'],
  'gimnasio': ['Membresía mensual', 'Clases grupales', 'Entrenamiento personalizado'],
  'barbería': ['Corte', 'Barba', 'Arreglo facial'],
  'cirugía estética': ['Valoración', 'Procedimientos estéticos'],
  'inmobiliaria': ['Venta de propiedades', 'Arriendos', 'Valoración'],
  'negocio local': ['Consulta', 'Servicios'],
};

function normalizePhone(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('3')) d = '57' + d;
  if (d.length === 11 && d.startsWith('04')) d = '58' + d.slice(1);
  if (d.length === 10 && d.startsWith('4')) d = '58' + d;
  if (d.length === 13 && d.startsWith('0584')) d = '58' + d.slice(2);
  return (d.length >= 10 && d.length <= 13) ? d : null;
}

function buildRow(lead, usedSlugs) {
  const name = cleanName(lead.name);
  if (!name || name.length < 3) return null;
  let slug = slugify(name);
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${slugify(name)}-${n++}`;
  usedSlugs.add(slug);

  const cat = realCategory(lead);
  const phone = normalizePhone(lead.phone || lead.phone_raw);
  const city = (lead.ciudad || '').trim();
  const rating = parseFloat(lead.rating) || null;

  return {
    id: `GKI-${crypto.randomUUID()}`,
    slug,
    name,
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    description: `${name} en ${city || 'tu ciudad'}. Negocio de ${cat} localizado vía Google Maps y listado en Guaki para que los clientes te encuentren y te escriban directo por WhatsApp.`,
    short_description: `${cat} en ${city || 'tu ciudad'} — contacto directo sin intermediarios.`,
    city: city || null,
    address: (lead.address || '').trim() || null,
    phone: phone ? `+${phone}` : null,
    whatsapp: phone ? `+${phone}` : null,
    website: (lead.website || '').trim() || null,
    rating: rating && rating > 0 ? rating : null,
    plan: 'free',
    claim_status: 'unclaimed',
    status: 'published',
    services: SERVICES_BY_CAT[cat] || SERVICES_BY_CAT['negocio local'],
    source: 'import-master-guaki-2026-09-23',
  };
}

// ---- main ----
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const runIdx = args.indexOf('--run');
const limit = runIdx >= 0 && args[runIdx + 1] ? parseInt(args[runIdx + 1], 10) : null;

const master = JSON.parse(readFileSync(MASTER, 'utf-8'));

// Slugs ya existentes en la BD (dedupe)
async function existingSlugs() {
  const r = await fetch(`${URL}/rest/v1/businesses?select=slug&limit=10000`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!r.ok) return new Set();
  const rows = await r.json();
  return new Set(rows.map((x) => x.slug));
}

async function insertRow(row) {
  const r = await fetch(`${URL}/rest/v1/businesses`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 160)}`);
  }
}

const usedSlugs = await existingSlugs();
console.log(`slugs existentes en BD: ${usedSlugs.size}`);

const rows = [];
for (const lead of master) {
  const row = buildRow(lead, usedSlugs);
  if (row) rows.push(row);
}
console.log(`filas construibles: ${rows.length} (de ${master.length} leads del master)`);

const target = limit ? rows.slice(0, limit) : rows;

if (dry) {
  console.log(`\nPRUEBA (--dry, sin escribir): ${target.length} filas.`);
  for (const r of target.slice(0, 5)) {
    console.log(`  - ${r.name} | ${r.category} | ${r.city} | ${r.slug} | tel=${r.phone} | plan=${r.plan} | claim=${r.claim_status}`);
  }
  console.log('  ejemplo JSON:', JSON.stringify(target[0]).slice(0, 500));
  process.exit(0);
}

let ok = 0, fail = 0;
const errors = [];
for (const row of target) {
  try {
    await insertRow(row);
    ok++;
  } catch (e) {
    fail++;
    if (errors.length < 3) errors.push(`${row.slug}: ${e.message}`);
  }
  process.stdout.write(`\rinsertadas: ${ok} / ${target.length} (fallos: ${fail})   `);
}
console.log(`\n\nRESUMEN: ${ok} insertadas OK, ${fail} fallos.`);
if (errors.length) console.log('ejemplos de fallo:', errors.join('\n'));
console.log(`Fichas pre-creadas en https://guaki.online/proveedores/{slug} con CTA de reclamar.`);
