/**
 * #35 PRECIOS FUERA DE RANGO — detecta servicios con precio anómalo (3σ)
 * respecto al rango de su categoría+ciudad y sugiere revisión.
 *
 * Uso:
 *   node scripts/precios_fuera_rango.mjs          (dry-run, solo lectura)
 *
 * Reglas honestas:
 *  - Sin escrituras en BD: solo lectura + reporte.
 *  - Requiere muestra suficiente (≥8 precios) por grupo categoría+ciudad;
 *    si no hay muestra, el grupo salta (sin inventar rangos).
 *  - El flag NUNCA es punitivo: el reporte dice "sugerir revisión", nada más.
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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const MIN_SAMPLE = 8;      // muestra mínima por grupo (media±3σ estable)
const SIGMA = 3;

// Extrae el primer precio "$45.000" / "$3.500.000" / "$80.000" de un string.
// Devuelve número (sin separadores de miles) o null.
function parsePrice(s) {
  const m = String(s).match(/\$\s?(\d[\d.,]*)/);
  if (!m) return null;
  const digits = m[1].replace(/[.,]/g, '');
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchBusinesses() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const H = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };
  const url = `${SUPABASE_URL}/rest/v1/businesses?select=id,name,category,city,services&services=not.is.null&status=eq.published&limit=10000`;
  const r = await fetch(url, { headers: H });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

(async () => {
  console.log('=== #35 Precios fuera de rango (categoría+ciudad, 3σ) ===\n');

  const businesses = await fetchBusinesses();
  console.log(`Fichas consultadas: ${businesses.length}`);

  // Extraer todos los puntos de precio: (grupo = categoría+ciudad)
  const groups = new Map(); // key -> [{businessId, name, service, price}]
  for (const b of businesses) {
    const services = Array.isArray(b.services) ? b.services : [];
    const groupKey = `${(b.category || '').toLowerCase().trim()}|${(b.city || '').toLowerCase().trim()}`;
    for (const svc of services) {
      const price = parsePrice(svc);
      if (price === null) continue;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push({
        businessId: b.id, name: b.name, city: b.city, service: String(svc).trim(), price,
      });
    }
  }

  let groupsEvaluated = 0;
  let groupsSkipped = 0;
  const outliers = [];

  for (const [key, points] of groups) {
    if (points.length < MIN_SAMPLE) { groupsSkipped++; continue; }
    groupsEvaluated++;
    const values = points.map((p) => p.price);
    const mean = values.reduce((a, v) => a + v, 0) / values.length;
    const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
    const sigma = Math.sqrt(variance);
    if (sigma === 0) { continue; } // todos iguales: nada fuera de rango
    const lo = mean - SIGMA * sigma;
    const hi = mean + SIGMA * sigma;
    for (const p of points) {
      if (p.price < lo || p.price > hi) {
        outliers.push({ ...p, mean, sigma, group: key });
      }
    }
  }

  console.log(`Grupos evaluados (muestra ≥ ${MIN_SAMPLE}): ${groupsEvaluated}`);
  console.log(`Grupos saltados (muestra insuficiente): ${groupsSkipped}`);
  console.log(`Precios fuera de rango (3σ): ${outliers.length}`);

  if (outliers.length === 0) {
    console.log('\nSin anomalías: ningún precio queda fuera del rango de su categoría+ciudad.');
    process.exit(0);
  }

  console.log('\n--- OUTLIERS (sugerir revisión, nunca punitivo) ---');
  for (const o of outliers.slice(0, 50)) {
    const dir = o.price > o.mean + SIGMA * o.sigma ? 'MUY ALTO' : 'MUY BAJO';
    console.log(`  ${dir} | ${o.name} (${o.city}) — "${o.service}" = $${o.price.toLocaleString()} | media del grupo: $${Math.round(o.mean).toLocaleString()}`);
  }
  if (outliers.length > 50) console.log(`  ... y ${outliers.length - 50} más`);

  console.log('\nAcción sugerida: revisar manualmente cada ficha y pedir al dueño que confirme o corrija el precio vía el dashboard.');
  process.exit(0);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
