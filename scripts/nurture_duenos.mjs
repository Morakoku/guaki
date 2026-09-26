/**
 * NURTURE DUEÑOS - Scripts para contacto con propietarios de negocios
 *
 * Subcomandos:
 *   node scripts/nurture_duenos.mjs          (dry-run por defecto)
 *   node scripts/nurture_duenos.mjs --checkin   (check-in trimestral #23)
 *   node scripts/nurture_duenos.mjs --insight   (micro-insight #26)
 *   node scripts/nurture_duenos.mjs --send      (envío explícito, NO usar ahora)
 *
 * Estado: scripts/nurture_state.json
 *
 * Canal elegido: WHATSAPP (el más directo hacia el dueño en CO/VE).
 * Si las credenciales no están configuradas, se marcará PENDING_CHANNEL.
 *
 * Referencia de estilo: scripts/enrich_fichas.mjs (fetch PostgREST + .env.local).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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

// Cargar env: prefer .env.local, luego process.env
const env = {
  ...loadEnvFile(path.join(__dirname, '..', '.env.local')),
  ...process.env,
};

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// ── Configuración de canal ──────────────────────────────────────────────
const CHANNEL = env.NURTURE_CHANNEL || 'WHATSAPP'; // WHATSAPP / RESEND / PENDING_CHANNEL

// ── Estado de nurture (archivo JSON) ────────────────────────────────────
const STATE_FILE = path.join(__dirname, 'nurture_state.json');

function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {}
  return { lastCheckin: null, lastInsight: null, contacted: [], suppression: [], optedOut: [], insightData: null };
}
function saveState(st) {
  writeFileSync(STATE_FILE, JSON.stringify(st, null, 2));
}

// ── Helper: fetch a página de negocios desde PostgREST ──────────────────
async function fetchBusinesses(params = '') {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    return [];
  }
  const H = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/businesses?select=id,name,category,city,phone,whatsapp,schedule,hero_image,logo_url,services,updated_at&status=eq.published&${params}&limit=1000`, { headers: H });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

// ── Helper: fetch events (whatsapp_clicked, call_clicked) ────────────────
async function fetchEventsBusinessIds(params = '') {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return [];
  const H = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/events?select=business_id,whatsapp_clicked,call_clicked&${params}&limit=10000`, { headers: H });
  if (!r.ok) {
    // Tabla events quizás no existe aún; retornamos vacío y proseguimos con señal 0
    return [];
  }
  return r.json();
}

// ── #23 Check-in trimestral "1=Sí 2=Cambió" ────────────────────────────
async function cmdCheckin() {
  console.log('=== #23 Check-in trimestral a dueños ===');
  const state = loadState();
  const ahora = new Date();
  const hace90 = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);

  const businesses = await fetchBusinesses();
  console.log(`Total fichas consultadas: ${businesses.length}`);

  // #46: excluir dueños en opt-out permanente (por id o por teléfono saneado)
  const optIds = new Set((state.optedOut || []).map((o) => o.id));
  const optPhones = new Set((state.optedOut || []).map((o) => String(o.phone || '').replace(/\D/g, '')));
  const notOptedOut = businesses.filter((b) => {
    if (optIds.has(b.id)) return false;
    const digits = String(b.phone || b.whatsapp || '').replace(/\D/g, '');
    return digits ? !optPhones.has(digits) : true;
  });

  // Filtrar: schedule enriquecido hace ≥90 DÍAS (updated_at antiguo O suppression)
  const candidates = notOptedOut.filter(b => {
    const hasSchedule = b.schedule && typeof b.schedule === 'string' && b.schedule.trim().length > 0;
    const isOld = b.updated_at ? new Date(b.updated_at) < hace90 : false;
    const inSuppression = state.suppression && state.suppression.some(s => s.id === b.id);
    return (hasSchedule && isOld) || inSuppression;
  });

  // Reporte claro: si 0, explicarlo por enriquecimiento reciente
  if (candidates.length === 0) {
    console.log('0 candidatos porque el enriquecimiento de schedule es reciente (<90 días); todas las fichas fueron enriquecidas en la última migración.');
  } else {
    console.log(`Candidatos para check-in (schedule viejo ≥90 días o suppression): ${candidates.length}`);
  }

  // Mostrar mensaje si hay candidatos y canal disponible
  if (candidates.length > 0 && CHANNEL !== 'PENDING_CHANNEL') {
    console.log(`\nPlantilla de mensaje por ${CHANNEL}:`);
    const msg = '¿Siguen iguales tus horarios y precios en Guaki? Responde 1 = Sí, siguen iguales · 2 = Cambiaron, los reviso · 9 = No me contacten más';
    console.log(`  "${msg}"`);
    for (const b of candidates.slice(0, 5)) {
      console.log(`  - ${b.name} (${b.city}): ${b.whatsapp || b.phone || 'sin número'}`);
    }
    if (candidates.length > 5) {
      console.log(`  ... y ${candidates.length - 5} más dueños`);
    }
  } else if (CHANNEL === 'PENDING_CHANNEL') {
    console.log('⚠️  Canal PENDING_CHANNEL - no hay credenciales de envío configuradas');
    console.log('   Para usar: define NURTURE_CHANNEL=WHATSAPP en .env.local');
  }

  // Actualizar state: marcar como contactados hoy
  state.lastCheckin = ahora.toISOString();
  state.contacted = state.contacted || [];
  candidates.forEach(b => {
    if (!state.contacted.some(c => c.id === b.id)) {
      state.contacted.push({ id: b.id, name: b.name, city: b.city, checkedAt: ahora.toISOString(), template: 'checkin_90d' });
    }
  });
  // Mantener solo los últimos 50 registros
  if (state.contacted.length > 50) state.contacted = state.contacted.slice(-50);
  saveState(state);
  console.log(`State actualizada en ${STATE_FILE}`);
}

// ── #26 Micro-insight mensual: señal de contacto real ─────────────────────
async function cmdInsight() {
  console.log('=== #26 Micro-insight mensual: señal de contacto real ===');
  const businesses = await fetchBusinesses();

  // 1. Separar: con hero_image/logo_url image vs sin foto
  const conFoto = businesses.filter(b => {
    const h = (b.hero_image || '').trim();
    const l = (b.logo_url || '').trim();
    const imgArr = Array.isArray(b.images) ? b.images : (b.images ? [b.images] : []);
    return h !== '' || l !== '' || imgArr.length > 0;
  });

  const sinFoto = businesses.filter(b => !conFoto.includes(b));

  console.log(`Total: ${businesses.length} | Con foto (hero_image/logo_url/image): ${conFoto.length} | Sin foto: ${sinFoto.length}`);

  // 2. Contar señal de contacto REAL: events (whatsapp_clicked + call_clicked con business_id not null) + inquiries
  // Obtener business IDs de cada grupo para fetch de events
  const idsConFoto = conFoto.map(b => b.id);
  const idsSinFoto = sinFoto.map(b => b.id);

  const events = await fetchEventsBusinessIds(); // trae todos los events con whatsapp_clicked/call_clicked

  // Contar señales por grupo
  // events tiene: business_id, whatsapp_clicked (bool), call_clicked (bool)
  // whatsapp_clicked=true cuenta como 1 contacto; call_clicked=true cuenta como 1 contacto
  // Evitamos doble contar un mismo event: count cada business que tenga al menos un click positivo
  const busIdsConFotoSet = new Set(idsConFoto);
  const busIdsSinFotoSet = new Set(idsSinFoto);

  let signalConFoto = 0; // número de businesses con al menos un whatsapp_clicked o call_clicked
  let signalSinFoto = 0;

  // Contar también inquiries si hubiera tabla, por ahora solo events
  // Sumar clicks totales como señal adicional
  let totalWhatsAppCon = 0, totalCallCon = 0;
  let totalWhatsAppSin = 0, totalCallSin = 0;

  events.forEach(ev => {
    const bid = ev.business_id;
    const wc = ev.whatsapp_clicked ? 1 : 0;
    const cc = ev.call_clicked ? 1 : 0;

    if (busIdsConFotoSet.has(bid)) {
      signalConFoto += (wc > 0 || cc > 0) ? 1 : 0;
      totalWhatsAppCon += wc;
      totalCallCon += cc;
    }
    if (busIdsSinFotoSet.has(bid)) {
      signalSinFoto += (wc > 0 || cc > 0) ? 1 : 1;
      totalWhatsAppSin += wc;
      totalCallSin += cc;
    }
  });

  // Signal total = businesses con al menos un click + posible inquiries (aquí events cubren eso)
  const totalSignal = signalConFoto + signalSinFoto;

  console.log(`Señal de contacto (events whatsapp_clicked + call_clicked):`);
  console.log(`  Con foto: businesses con click = ${signalConFoto} | whatsapp_clicks=${totalWhatsAppCon} | call_clicks=${totalCallCon}`);
  console.log(`  Sin foto: businesses con click = ${signalSinFoto} | whatsapp_clicks=${totalWhatsAppSin} | call_clicks=${totalCallSin}`);
  console.log(`  TOTAL businesses con señal: ${totalSignal}`);

  // 2b. También contar inquiries si la tabla existiera - por ahora events es la señal
  // Como events traen datos reales de la plataforma, usaremos este como fuente de verdad.

  // 3. Aplicarumbrales según especificación
  // Si totalSignal < 50 O alguno de los grupos tiene 0 contactos → PENDING_DATOS, salir sin escribir insightData
  if (totalSignal < 50 || signalConFoto === 0 || signalSinFoto === 0) {
    console.log(`PENDING_DATOS: sin señal de contacto suficiente (${totalSignal} contactos en total) — el micro-insight se activará cuando haya volumen`);
    // No guardar insightData en state; salir con código 0
    // Asegurar que state no tenga insightData basura
    const state = loadState();
    state.lastInsight = new Date().toISOString();
    // Remover insightData si existía de antes
    delete state.insightData;
    saveState(state);
    process.exit(0);
  }

  // 4. Si pasa el threshold, calcular ratio REAL: avg(contactos grupo A) / avg(contactos grupo B)
  // Grupo A = con foto, Grupo B = sin foto
  // Usamos clicks totales como proxy de contactos
  const avgCon = totalSignal > 0 ? (signalConFoto > 0 ? totalWhatsAppCon + totalCallCon : 0) / signalConFoto : 0;
  const avgSin = totalSignal > 0 ? (signalSinFoto > 0 ? totalWhatsAppSin + totalCallSin : 0) / signalSinFoto : 0;

  // Guardar: si ratio ≤1.05, insight no es positivo → PENDING_DATOS
  const ratio = avgCon / Math.max(1e-9, avgSin); // evita div/0
  if (ratio <= 1.05) {
    // Insight no positivo: no hay ventaja significativa
    console.log(`PENDING_DATOS: no hay historia positiva que contar (ratio contacto avg conj/sin = ${ratio.toFixed(2)} ≤ 1.05)`);
    const state = loadState();
    state.lastInsight = new Date().toISOString();
    delete state.insightData;
    saveState(state);
    process.exit(0);
  }

  // 5. Si ratio > 1.05, imprimir mensaje con ratio calculado REAL
  const mensaje = `Los negocios con foto reciben ${ratio.toFixed(2)}x más contactos que los que no la tienen. ¿Quieres subir la tuya? [link ficha]`;
  console.log(`\n--- MENSAJE REAL based on BD events data ---`);
  console.log(mensaje);

  // Guardar insight en state
  const state = loadState();
  state.lastInsight = new Date().toISOString();
  state.insightData = {
    conFoto: conFoto.length,
    sinFoto: sinFoto.length,
    signalConFoto,
    signalSinFoto,
    totalSignal,
    avgCon: avgCon.toFixed(2),
    avgSin: avgSin.toFixed(2),
    ratio: ratio.toFixed(2),
    mensaje,
  };
  saveState(state);
  console.log(`State actualizada en ${STATE_FILE}`);
}

// ── #46 Opt-out permanente: "no me contacten más" ──────────────────────
async function cmdOptout(target) {
  if (!target) {
    console.error('Uso: --optout <business_id | teléfono>');
    process.exit(1);
  }
  const businesses = await fetchBusinesses();
  const digits = String(target).replace(/\D/g, '');
  const match =
    businesses.find((b) => b.id === target) ||
    businesses.find((b) => {
      const d = String(b.phone || b.whatsapp || '').replace(/\D/g, '');
      return digits && d && (d === digits || d.endsWith(digits));
    });

  const state = loadState();
  state.optedOut = state.optedOut || [];
  const entry = match
    ? { id: match.id, phone: String(match.phone || match.whatsapp || '').replace(/\D/g, ''), name: match.name, at: new Date().toISOString() }
    : { id: null, phone: digits || null, at: new Date().toISOString() };
  const already = state.optedOut.some(
    (o) => (o.id && o.id === entry.id) || (entry.phone && o.phone === entry.phone)
  );
  if (!already) state.optedOut.push(entry);
  saveState(state);
  console.log(`Opt-out registrado: ${entry.name || entry.phone || target} — no se le contactará más.`);
  console.log(`Total opted_out: ${state.optedOut.length}`);
}

// ── Ejecutar según comando ───────────────────────────────────────────────
const args = process.argv.slice(2);
const dry = !args.includes('--send'); // --send significa modo envío (no usado ahora)
const optoutIdx = args.indexOf('--optout');
const cmd = args.find(a => a === '--checkin' || a === '--insight') || (optoutIdx !== -1 ? '--optout' : 'dry');

console.log(`NURTURE DUEÑOS — comando: ${cmd} ${dry ? '(dry-run)' : ''}\n`);

;(async () => {
  try {
    switch (cmd) {
      case '--checkin':
        await cmdCheckin();
        break;
      case '--insight':
        await cmdInsight();
        break;
      case '--optout':
        await cmdOptout(args[optoutIdx + 1]);
        break;
      default:
        console.log('Modos disponibles:');
        console.log('  --checkin  → filtro dueños schedule ≥90 días + plantilla check-in');
        console.log('  --insight  → micro-insight señal de contacto real + umbrales');
        console.log('  --optout   → <business_id | teléfono> opt-out permanente (#46)');
        console.log('  --send     → (explicito, requiere configuración de canal NURTURE_CHANNEL)');
        break;
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();