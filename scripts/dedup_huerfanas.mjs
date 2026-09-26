/**
 * DEDUP Y HUÉRFANAS - Script de diagnóstico y fusión de duplicados
 *
 * Subcomandos:
 *   node scripts/dedup_huerfanas.mjs              (dry-run por defecto)
 *   node scripts/dedup_huerfanas.mjs --apply      (no usar ahora, requiere --force)
 *
 * Estado: scripts/dedup_state.json (opcional, solo lecturas)
 *
 * Referencia de estilo: scripts/enrich_fichas.mjs (fetch PostgREST + .env.local)
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

const env = {
  ...loadEnvFile(path.join(__dirname, '..', '.env.local')),
  ...process.env,
};

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// ── Configuración ─────────────────────────────────────────────────────────
const CHANNEL = 'WHATSAPP';

// ── Estado opcional ───────────────────────────────────────────────────────
const STATE_FILE = path.join(__dirname, 'dedup_state.json');

function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {}
  return { runId: Date.now(), groups: [], reported: [] };
}
function saveState(st) {
  writeFileSync(STATE_FILE, JSON.stringify(st, null, 2));
}

// ── Helper: normalize name (lowercase, sin acentos, sin puntuación, trim) ────
function normalizeName(s) {
  if (typeof s !== 'string') return '';
  let s2 = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s2 = s2.replace(/[^\w\s]/g, '');
  return s2.toLowerCase().trim();
}

// ── Helper: normalize city (sin acentos, minúsculas, trim) ────────────────
function normalizeCity(c) {
  if (typeof c !== 'string') return '';
  let c2 = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return c2.toLowerCase().trim();
}

// ── Helper: normalize phone/whatsApp (solo dígitos) ──────────────────────
function normalizePhone(p) {
  if (typeof p !== 'string') return '';
  return p.replace(/\D/g, '');
}

// ── 1. DEDUP — fusión de candidatos ───────────────────────────────────────
async function cmdDedup() {
  console.log('=== #36 Dedup y huérfanas: fusión de candidatos ===');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  const H = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };

  // 1.1. Fetch businesses: solo published + drafts
  const r = await fetch(`${SUPABASE_URL}/rest/v1/businesses?select=id,name,category,city,phone,whatsapp,guaki_score,profile_completion,services,status,updated_at&status=in.(published,draft)&limit=1000`, { headers: H });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  const allBusinesses = await r.json();
  console.log(`Total businesses (published + draft): ${allBusinesses.length}`);

  // 1.2. Agrupar por spec #36: "nombres + teléfonos idénticos".
  //   Teléfono idéntico es REQUISITO. El nombre se compara de forma tolerante:
  //   idéntico, uno contenido en el otro ("Clínica Dental Home" dentro de
  //   "Clínica Dental Home - Diseño de Sonrisa…") o misma ciudad + alta
  //   coincidencia de tokens. Así cadenas con sucursales distintas por barrio
  //   (Synlab Chapinero vs Synlab Galerías) NO se fusionan, pero el duplicado
  //   real sí aparece.
  const groupsMap = new Map();

  const nombresEquivalentes = (a, b) => {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;
    const ta = a.split(/\s+/).filter(t => t.length > 2);
    const tb = b.split(/\s+/).filter(t => t.length > 2);
    if (!ta.length || !tb.length) return false;
    const shared = ta.filter(t => tb.includes(t)).length;
    return shared / Math.max(ta.length, tb.length) >= 0.8;
  };

  allBusinesses.forEach(b => {
    const pNorm = normalizePhone(b.phone || b.whatsapp || '');
    const nNorm = normalizeName(b.name);
    const cityNorm = normalizeCity(b.city);

    if (pNorm.length >= 7) {
      // Buscar un grupo existente con mismo teléfono + nombre equivalente
      let matched = null;
      for (const g of groupsMap.values()) {
        if (g.normalizedPhone === pNorm && nombresEquivalentes(g.normalizedName, nNorm)) {
          matched = g;
          break;
        }
      }
      if (!matched) {
        matched = { key: `phone:${pNorm}::${nNorm}`, normalizedPhone: pNorm, normalizedName: nNorm, city: cityNorm, businesses: [] };
        groupsMap.set(matched.key, matched);
      }
      matched.businesses.push(b);
    } else {
      const key = `namecity:${nNorm}::${cityNorm}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, { key, normalizedPhone: pNorm, normalizedName: nNorm, city: cityNorm, businesses: [] });
      }
      groupsMap.get(key).businesses.push(b);
    }
  });

  // Filtrar solo grupos con más de 1 negocio (candidatos a dup)
  const dupGroups = [];
  groupsMap.forEach(g => {
    if (g.businesses.length > 1) {
      dupGroups.push(g);
    }
  });

  console.log(`Grupos de candidatos a duplicados: ${dupGroups.length}`);

  // 1.3. Para cada grupo, elegir ganador por: guaki_score DESC > profile_completion DESC > más servicios
  const resolved = [];

  for (const g of dupGroups) {
    const burgers = g.businesses.sort((a, b) => {
      if ((b.guaki_score ?? 0) !== (a.guaki_score ?? 0)) {
        return (b.guaki_score ?? 0) - (a.guaki_score ?? 0);
      }
      if ((b.profile_completion ?? 0) !== (a.profile_completion ?? 0)) {
        return (b.profile_completion ?? 0) - (a.profile_completion ?? 0);
      }
      const svcA = a.services || [];
      const svcB = b.services || [];
      return svcB.length - svcA.length;
    });

    const winner = burgers[0];
    const losers = burgers.slice(1);

    // Campos que diferencian entre los miembros del grupo
    const differingFields = {};
    const fieldNames = ['name', 'category', 'city', 'phone', 'whatsapp', 'guaki_score', 'profile_completion'];
    for (const field of fieldNames) {
      const values = burgers.map(b => b[field]);
      const unique = [...new Set(values.filter(v => v != null && v !== ''))];
      if (unique.length > 1) {
        differingFields[field] = { count: values.length, examples: unique.slice(0, 3) };
      }
    }

    resolved.push({
      groupKey: g.key,
      winner: {
        id: winner.id,
        name: winner.name,
        guaki_score: winner.guaki_score,
        profile_completion: winner.profile_completion,
        servicesCount: (winner.services || []).length,
        status: winner.status,
      },
      losers: losers.map(l => ({
        id: l.id,
        name: l.name,
        guaki_score: l.guaki_score,
        profile_completion: l.profile_completion,
        status: l.status,
      })),
      differingFields,
    });
  }

  console.log(`Grupos fusionados/resueltos: ${resolved.length}`);

  // Mostrar los 5 primeros grupos
  for (let i = 0; i < Math.min(5, resolved.length); i++) {
    const g = resolved[i];
    console.log(`\n--- Grupo ${i + 1} (key: ${g.groupKey.substring(0, 30)}...) ---`);
    console.log(`Ganador: ${g.winner.name} (score:${g.winner.guaki_score}, completion:${g.winner.profile_completion}, services:${g.winner.servicesCount})`);
    console.log(`Perdedores: ${g.losers.map(l => `${l.name} (score:${l.guaki_score})`).join(', ')}`);
    if (Object.keys(g.differingFields).length > 0) {
      console.log('Campos que difieren entre miembros del grupo:');
      for (const [field, info] of Object.entries(g.differingFields)) {
        console.log(`  - ${field}: ${info.examples.join(', ')} (${info.count} valores distintos)`);
      }
    } else {
      console.log('Ningún campo crítico difiere entre los miembros del grupo (son idénticos en los campos evaluados).');
    }
  }

  // Guardar estado opcional (solo lecturas)
  const state = loadState();
  state.groups = dupGroups.map(g => ({
    key: g.key,
    winnerCount: 1,
    loserCount: g.businesses.length - 1,
    fieldCount: Object.keys(g.differingFields || {}).length,
  }));
  state.reported = [...state.reported, ...resolved.map(r => ({ groupKey: r.groupKey, winnerId: r.winner.id, loserCount: r.losers.length }))];
  saveState(state);
  console.log(`State guardada en ${STATE_FILE} (solo lecturas)`);
}

// ── 2. WHATSAPP HUÉRFANO / rebote ─────────────────────────────────────────
async function cmdBounce() {
  console.log('\n=== #36 WhatsApp huérfano / rebote ===');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan credenciales SUPABASE');
    return;
  }
  const H = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };

  // Revisar tabla events por event_name tipo whatsapp_bounce o send_failed
  const r = await fetch(`${SUPABASE_URL}/rest/v1/events?select=id,event_name,business_id&event_name=in.(whatsapp_bounce,send_failed)&limit=1000`, { headers: H });
  if (!r.ok) {
    console.error(`HTTP ${r.status} al consultar events`);
    return;
  }
  const events = await r.json();

  const bounceEvents = events.filter(e => e.event_name === 'whatsapp_bounce' || e.event_name === 'send_failed');
  const totalBounceEvents = bounceEvents.length;

  console.log(`Total events whatsapp_bounce/send_failed en BD: ${totalBounceEvents}`);

  if (totalBounceEvents === 0) {
    console.log(`PENDING_DATA: no hay señal de rebote en la BD (tabla events sin event_name whatsapp_bounce/send_failed)`);
    console.log(`Los 3 intentos de reenvío al dueño no tienen registro de fallo automático en la base`);
    console.log(`Recomendación: crear evento de bounce en events table cuando un mensaje falle ×3, o revisar logs de proveedor WhatsApp`);
  } else {
    console.log(`Señal de rebote encontrada: ${totalBounceEvents} events`);
    const samples = bounceEvents.slice(0, 5);
    for (const e of samples) {
      console.log(`  - event_name: ${e.event_name}, business_id: ${e.business_id}, timestamp: ${e.timestamp}`);
    }
  }
}

// ── Ejecutar según comando ───────────────────────────────────────────────
const args = process.argv.slice(2);
const dry = !args.includes('--apply'); // --apply = modo ejecución (no usar ahora)
const cmd = args.find(a => a === '--dedup' || a === '--bounce') || 'dry';

console.log(`DEDUP Y HUÉRFANOS — comando: ${cmd} ${dry ? '(dry-run)' : ''}\n`);

;(async () => {
  try {
    switch (cmd) {
      case '--dedup':
        await cmdDedup();
        break;
      case '--bounce':
        await cmdBounce();
        break;
      default:
        console.log('Modos disponibles:');
        console.log('  --dedup  → busca y reporta grupos de duplicados candidatos');
        console.log('  --bounce → revisa señal de rebote WhatsApp en tabla events');
        console.log('  --apply  → (modo ejecución, NO usar ahora - marcaría perdedores como merged)');
        break;
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();