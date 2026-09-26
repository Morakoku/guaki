/**
 * ENRIQUECIMIENTO de fichas (bloque 2 — decisión Edwin 24/09: "enriquecer las
 * fichas para que el cliente vea que sí vale la pena antes de contactar").
 *
 * Para cada ficha importada SIN horarios/servicios con precio/fotos:
 *   1. Horarios realistas por categoría (JSONB [{day, hours, isOpen}])
 *   2. Servicios con precios de mercado (CO=COP, VE=USD según el prefijo)
 *   3. Fotos del pool local por categoría con variedad (hash del id)
 *
 * Uso: node scripts/enrich_fichas.mjs --dry 3   (prueba sin escribir)
 *      node scripts/enrich_fichas.mjs --run 3   (enriquece 3)
 *      node scripts/enrich_fichas.mjs --run     (enriquece TODO)
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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

// ---- horarios por categoría ----
const SCHEDULES = {
  dental: [
    { day: 'Lunes a Viernes', hours: '8:00 AM – 6:00 PM', isOpen: true },
    { day: 'Sábado', hours: '8:00 AM – 1:00 PM', isOpen: true },
    { day: 'Domingo', hours: 'Cerrado', isOpen: false },
  ],
  barberia: [
    { day: 'Lunes a Sábado', hours: '9:00 AM – 7:00 PM', isOpen: true },
    { day: 'Domingo', hours: '9:00 AM – 1:00 PM', isOpen: true },
  ],
  salon: [
    { day: 'Lunes a Sábado', hours: '9:00 AM – 7:00 PM', isOpen: true },
    { day: 'Domingo', hours: 'Cerrado', isOpen: false },
  ],
  spa: [
    { day: 'Lunes a Sábado', hours: '9:00 AM – 7:00 PM', isOpen: true },
    { day: 'Domingo', hours: '10:00 AM – 2:00 PM', isOpen: true },
  ],
  unas: [
    { day: 'Lunes a Sábado', hours: '9:00 AM – 7:00 PM', isOpen: true },
    { day: 'Domingo', hours: '10:00 AM – 2:00 PM', isOpen: true },
  ],
  gimnasio: [
    { day: 'Lunes a Viernes', hours: '5:00 AM – 10:00 PM', isOpen: true },
    { day: 'Sábado', hours: '7:00 AM – 6:00 PM', isOpen: true },
    { day: 'Domingo', hours: '8:00 AM – 1:00 PM', isOpen: true },
  ],
  tatuajes: [
    { day: 'Lunes a Sábado', hours: '10:00 AM – 8:00 PM', isOpen: true },
    { day: 'Domingo', hours: 'Cerrado', isOpen: false },
  ],
  cirugia: [
    { day: 'Lunes a Viernes', hours: '8:00 AM – 5:00 PM', isOpen: true },
    { day: 'Sábado', hours: 'Cerrado', isOpen: false },
  ],
  veterinaria: [
    { day: 'Lunes a Sábado', hours: '8:00 AM – 6:00 PM', isOpen: true },
    { day: 'Domingo', hours: '9:00 AM – 1:00 PM', isOpen: true },
  ],
  salud: [
    { day: 'Lunes a Viernes', hours: '7:00 AM – 6:00 PM', isOpen: true },
    { day: 'Sábado', hours: '8:00 AM – 12:00 PM', isOpen: true },
    { day: 'Domingo', hours: 'Cerrado', isOpen: false },
  ],
  inmobiliaria: [
    { day: 'Lunes a Viernes', hours: '8:30 AM – 6:30 PM', isOpen: true },
    { day: 'Sábado', hours: '9:00 AM – 1:00 PM', isOpen: true },
  ],
  general: [
    { day: 'Lunes a Sábado', hours: '9:00 AM – 6:00 PM', isOpen: true },
    { day: 'Domingo', hours: 'Cerrado', isOpen: false },
  ],
};

// ---- servicios con precios por categoría (CO=COP, VE=USD) ----
const SERVICES = {
  dental_co: ['Consulta general $45.000', 'Limpieza $80.000', 'Ortodoncia desde $3.500.000', 'Blanqueamiento $150.000'],
  dental_ve: ['Consulta general $10', 'Limpieza $20', 'Ortodoncia desde $350', 'Blanqueamiento $40'],
  barberia_co: ['Corte clásico $20.000', 'Barba $15.000', 'Corte + barba $30.000', 'Diseño $25.000'],
  barberia_ve: ['Corte clásico $5', 'Barba $4', 'Corte + barba $8'],
  salon_co: ['Corte y estilo $35.000', 'Color desde $90.000', 'Peinado para eventos $60.000', 'Tratamientos desde $50.000'],
  salon_ve: ['Corte y estilo $8', 'Color desde $20', 'Peinado para eventos $15'],
  spa_co: ['Masaje relajante $80.000', 'Facial $95.000', 'Pedicure spa $55.000', 'Package relajación $180.000'],
  spa_ve: ['Masaje relajante $18', 'Facial $22', 'Package relajación $40'],
  unas_co: ['Manicure $25.000', 'Pedicure $30.000', 'Uñas acrílicas $60.000', 'Nail art desde $10.000'],
  unas_ve: ['Manicure $6', 'Pedicure $8', 'Uñas acrílicas $15'],
  gimnasio_co: ['Membresía mensual $80.000', 'Clases grupales incluidas', 'Entrenamiento personalizado $50.000/sesión'],
  gimnasio_ve: ['Membresía mensual $15', 'Clases grupales incluidas', 'Entrenamiento personalizado $10/sesión'],
  tatuajes_co: ['Tatuaje desde $120.000', 'Diseño a medida $50.000', 'Retoque $40.000'],
  tatuajes_ve: ['Tatuaje desde $30', 'Diseño a medida $12'],
  cirugia_co: ['Valoración $120.000', 'Procedimientos desde $2.500.000'],
  cirugia_ve: ['Valoración $25', 'Procedimientos desde $600'],
  veterinaria_co: ['Consulta general $40.000', 'Vacunación $60.000', 'Peluquería canina $55.000', 'Urgencias 24/7'],
  veterinaria_ve: ['Consulta general $10', 'Vacunación $15', 'Peluquería canina $12'],
  salud_co: ['Consulta general $45.000', 'Valoración $60.000', 'Terapias desde $80.000'],
  salud_ve: ['Consulta general $10', 'Valoración $15', 'Terapias desde $20'],
  inmobiliaria_co: ['Venta de propiedades', 'Arriendos', 'Valoración gratuita'],
  inmobiliaria_ve: ['Venta de propiedades', 'Alquileres', 'Tasación gratuita'],
  general_co: ['Consulta $30.000', 'Servicios a medida'],
  general_ve: ['Consulta $8', 'Servicios a medida'],
};

function catKey(category) {
  const c = (category || '').toLowerCase();
  if (/odont|dental/.test(c)) return 'dental';
  if (/barber/.test(c)) return 'barberia';
  if (/unas|uñas|nail/.test(c)) return 'unas';
  if (/salon|bellez|peluq/.test(c)) return 'salon';
  if (/spa|estetic|estétic/.test(c)) return 'spa';
  if (/gimnas|fitness|crossfit/.test(c)) return 'gimnasio';
  if (/tatu/.test(c)) return 'tatuajes';
  if (/cirug/.test(c)) return 'cirugia';
  if (/vet|mascot/.test(c)) return 'veterinaria';
  if (/inmobil|real estate/.test(c)) return 'inmobiliaria';
  // 2026-09-24 (fix): salud captura psicólogos, salud mental, clínicas, médicos
  if (/salud|clinic|clínica|médic|medic|psico|fisio|nutri|laborator/.test(c)) return 'salud';
  return 'general';
}

// ---- fotos: pool local por categoría (variedad por hash del id) ----
const IMAGE_POOL = {
  dental: ['/images/dental/hero.jpg', '/images/dental/foto1.jpg', '/images/dental/foto2.jpg', '/images/dental/foto3.jpg', '/images/dental/foto4.jpg'],
  belleza: ['/images/belleza/hero.jpg', '/images/belleza/foto1.jpg', '/images/belleza/foto2.jpg'],
  spa: ['/images/providers/spa-1.jpg', '/images/providers/spa-2.jpg', '/images/belleza/foto1.jpg'],
  salud: ['/images/salud/hero.jpg', '/images/salud/foto1.jpg', '/images/salud/foto2.jpg'],
  veterinaria: ['/images/veterinaria/hero.jpg', '/images/veterinaria/foto1.jpg', '/images/veterinaria/foto2.jpg', '/images/providers/vet-1.jpg', '/images/providers/vet-2.jpg'],
  legal: ['/images/providers/legal-1.jpg', '/images/providers/legal-2.jpg'],
};
const FALLBACK_IMAGES = ['/images/fallback.svg'];

// 2026-09-24 (map fix): bounds por ciudad (los mismos del map-projection del
// app) — el enrichment asigna coordenadas aproximadas dentro de los bounds
// de cada ciudad, así el mapa del directorio tiene puntos que renderizar.
const CITY_BOUNDS = {
  medellin: { north: 6.28, south: 6.14, east: -75.49, west: -75.64 },
  bogota: { north: 4.76, south: 4.52, east: -74.03, west: -74.22 },
  cali: { north: 3.52, south: 3.32, east: -76.44, west: -76.62 },
  barranquilla: { north: 11.06, south: 10.86, east: -74.70, west: -74.92 },
  cartagena: { north: 10.46, south: 10.30, east: -75.44, west: -75.58 },
  bucaramanga: { north: 7.16, south: 7.04, east: -73.08, west: -73.20 },
  soacha: { north: 4.62, south: 4.51, east: -74.19, west: -74.25 },
  pereira: { north: 4.83, south: 4.73, east: -75.68, west: -75.77 },
  manizales: { north: 5.09, south: 5.01, east: -75.52, west: -75.55 },
  'santa marta': { north: 11.25, south: 11.16, east: -74.18, west: -74.23 },
  caracas: { north: 10.53, south: 10.41, east: -66.78, west: -66.95 },
  valencia: { north: 10.23, south: 10.14, east: -68.00, west: -68.05 },
  maracaibo: { north: 10.72, south: 10.60, east: -71.57, west: -71.67 },
  barquisimeto: { north: 10.11, south: 10.00, east: -69.35, west: -69.38 },
  maracay: { north: 10.29, south: 10.20, east: -67.62, west: -67.66 },
  'ciudad guayana': { north: 8.33, south: 8.23, east: -62.80, west: -62.85 },
  'merida': { north: 8.62, south: 8.54, east: -71.15, west: -71.18 },
  'san cristobal': { north: 7.79, south: 7.73, east: -72.25, west: -72.27 },
};

function latLngFor(city, id) {
  const normalized = (city || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const bounds = CITY_BOUNDS[normalized];
  if (!bounds) return null;
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  const lat = bounds.south + (bounds.north - bounds.south) * ((h % 100) / 100);
  const lng = bounds.west + (bounds.east - bounds.west) * ((Math.floor(h / 100) % 100) / 100);
  return { lat: Math.round(lat * 100000) / 100000, lng: Math.round(lng * 100000) / 100000 };
}

function imagesFor(category, id) {
  const key = catKey(category);
  const pool = IMAGE_POOL[key] || FALLBACK_IMAGES;
  // variedad: el hash del id decide el punto de inicio (las vecinas no repiten exacto)
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  const start = h % pool.length;
  return [pool[start % pool.length], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]];
}

function isVenezuela(b) {
  const phone = (b.phone || b.whatsapp || '').replace(/\D/g, '');
  if (phone.startsWith('58')) return true;
  const city = (b.city || '').toLowerCase();
  return ['caracas', 'maracaibo', 'valencia', 'maracay', 'barquisimeto', 'maturin'].some((c) => city.includes(c));
}

function enrichFor(b) {
  // 2026-09-24 (fix): el tipo real vive en el NOMBRE ("Psicóloga", "Salud
  // Mental", "Forum..."), no en la categoría del DB ("Negocio local" = el
  // fallback del import). El catKey mira ambos.
  const key = catKey((b.category || '') + ' ' + (b.name || ''));
  const ve = isVenezuela(b);
  const services = SERVICES[`${key}_${ve ? 've' : 'co'}`] || SERVICES[`general_${ve ? 've' : 'co'}`];
  const patch = {
    schedule: SCHEDULES[key] || SCHEDULES.general,
    services,
    images: imagesFor(key, b.id),
  };
  // Corregir la categoría en la BD cuando quedó como fallback genérico.
  const catLower = (b.category || '').toLowerCase().trim();
  if (!catLower || catLower === 'negocio local') {
    if (key !== 'general') patch.category = key.charAt(0).toUpperCase() + key.slice(1);
  }
  // 2026-09-24 (map fix): coordenadas aproximadas para las fichas sin lat/lng
  if (typeof b.lat !== 'number' || typeof b.lng !== 'number') {
    const coords = latLngFor(b.city, b.id);
    if (coords) {
      patch.lat = coords.lat;
      patch.lng = coords.lng;
    }
  }
  // --coords: SOLO las coordenadas (no tocar schedule/services/images ya enriquecidos)
  if (coordsOnly) {
    const solo = {};
    if (patch.lat !== undefined) { solo.lat = patch.lat; solo.lng = patch.lng; }
    return solo;
  }
  return patch;
}

// ---- main ----
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const coordsOnly = args.includes('--coords');
const runIdx = args.indexOf('--run');
const limit = runIdx >= 0 && args[runIdx + 1] ? parseInt(args[runIdx + 1], 10) : null;

async function fetchBatch(offset) {
  // --coords: solo las fichas SIN lat/lng (la segunda pasada del enrichment);
  // por defecto: las fichas sin horarios (la primera pasada).
  const filtro = coordsOnly ? 'lat.is.null' : 'or=(schedule.eq.[],schedule.is.null)';
  const r = await fetch(`${URL}/rest/v1/businesses?select=id,slug,name,category,city,phone,whatsapp,schedule,services,images,source,lat,lng&status=eq.published&${filtro}&limit=1000&offset=${offset}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return r.json();
}

// Fichas SIN horarios (las importadas) — las que ya tienen no se tocan.
let targets = [];
let offset = 0;
while (true) {
  const batch = await fetchBatch(offset);
  targets.push(...batch);
  if (batch.length < 1000) break;
  offset += 1000;
}
console.log(`fichas publicadas SIN horarios: ${targets.length}`);

const target = limit ? targets.slice(0, limit) : targets;

if (dry) {
  console.log(`\nPRUEBA (--dry): ${target.length} fichas.`);
  for (const b of target.slice(0, 3)) {
    const e = enrichFor(b);
    console.log(`\n  - ${b.name} (${b.category} · ${b.city})`);
    if (coordsOnly) {
      console.log(`    coords: ${e.lat}, ${e.lng}`);
    } else {
      console.log(`    horarios: ${e.schedule ? JSON.stringify(e.schedule[0]) : 'n/d'}`);
      console.log(`    servicios: ${e.services ? e.services.join(' · ') : 'n/d'}`);
      console.log(`    fotos: ${(e.images || []).join(', ')}`);
    }
  }
  process.exit(0);
}

let ok = 0, fail = 0;
const errores = [];
for (const b of target) {
  const patch = enrichFor(b);
  const r = await fetch(`${URL}/rest/v1/businesses?id=eq.${b.id}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
  if (r.ok) ok++;
  else {
    fail++;
    if (errores.length < 3) errores.push(`${b.slug}: HTTP ${r.status} ${(await r.text()).slice(0, 120)}`);
  }
  process.stdout.write(`\renriquecidas: ${ok} / ${target.length} (fallos: ${fail})   `);
}
console.log(`\n\nRESUMEN: ${ok} enriquecidas, ${fail} fallos.`);
if (errores.length) console.log('errores:', errores.join('\n'));
