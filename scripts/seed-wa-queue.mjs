// Seed de la cola WhatsApp de la Torre: toma leads reales del CRM (companies
// con WhatsApp valido + lead OPEN; fallback a companies con WhatsApp) y deja
// la cola de Guaki en N pendientes, sin duplicar numeros. Dry-run con --dry-run.
// Uso: node scripts/seed-wa-queue.mjs [objetivo=100] [--dry-run]
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const OBJ = '/storage/v1/object/torre/wa-queue.json';
const dryIdx = process.argv.indexOf('--dry-run');
const dry = dryIdx !== -1;
const objetivoNum = process.argv.slice(2).find((a) => /^\d+$/.test(a));
const objetivo = Number(objetivoNum ?? 100) || 100;

const envPath = 'C:/Users/edwin/Documents/Trinidad/guaki/.env.local';
const parseEnvFile = (p) =>
  fs.existsSync(p)
    ? Object.fromEntries(
        fs
          .readFileSync(p, 'utf8')
          .split(/\r?\n/)
          .filter((l) => l.includes('=') && !l.startsWith('#'))
          .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
      )
    : {};
const env = parseEnvFile(envPath);
// La URL real vive en .env.vercel.pull (en .env.local queda un placeholder).
const envPull = parseEnvFile('C:/Users/edwin/Documents/Trinidad/guaki/.env.vercel.pull');
const base = ((envPull.SUPABASE_URL || envPull.NEXT_PUBLIC_SUPABASE_URL || '').match(/^https:\/\/[a-z0-9-]+\.supabase\.co/) ? (envPull.NEXT_PUBLIC_SUPABASE_URL || envPull.SUPABASE_URL) : (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '')).replace(/\/$/, '');
if (!base) throw new Error('no hay URL real de Supabase (.env.vercel.pull)');
console.log('proyecto:', base.replace(/^https:\/\//, '').split('.')[0]);

// Keys candidatos: guaki/.env.local, mapache/backend/.env.local, mapache/.env.local.
const keyCandidatos = [
  env.SUPABASE_SERVICE_ROLE_KEY,
  parseEnvFile('C:/Users/edwin/Documents/Trinidad/mapache/backend/.env.local').SUPABASE_SERVICE_ROLE_KEY,
  parseEnvFile('C:/Users/edwin/Documents/Trinidad/mapache/.env.local').SUPABASE_SERVICE_ROLE_KEY,
].filter(Boolean);

async function keyValida(key) {
  const r = await fetch(`${base}/rest/v1/companies?select=id&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return r.ok;
}
let KEY = null;
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

for (const k of keyCandidatos) {
  if (await keyValida(k)) { KEY = k; break; }
}
if (!KEY) throw new Error('ninguna service key candidata es valida para el proyecto');

async function readQueue() {
  const r = await fetch(`${base}${OBJ}?cb=${Date.now()}`, { headers: { ...H(), 'Cache-Control': 'no-cache' } });
  if (r.status === 400 || r.status === 404) return { items: [] };
  if (r.status !== 200) throw new Error(`GET cola ${r.status}`);
  return (await r.json()) || { items: [] };
}

async function writeQueue(items) {
  const r = await fetch(`${base}${OBJ}`, {
    method: 'PUT',
    headers: { ...H(), 'x-upsert': 'true' },
    body: JSON.stringify({ items }),
  });
  if (![200, 201].includes(r.status)) throw new Error(`PUT cola ${r.status}: ${(await r.text()).slice(0, 140)}`);
}

const digits = (s) => String(s || '').replace(/\D/g, '');

const q = await readQueue();
const items = Array.isArray(q.items) ? q.items : [];
const telEnCola = new Set(items.map((i) => digits(i.phone || (i.wa_link || '').split('/').pop())));

const ahora = new Date().toISOString();
const nuevas = [];

let rows = await fetch(
  `${base}/rest/v1/leads?select=id,company_id,status,companies(id,name,city,whatsapp,phone,data_quality_score)&status=eq.OPEN&companies.whatsapp=not.is.null&order=id.desc&limit=400`,
  { headers: H },
);
if (!rows.ok) throw new Error(`leads ${rows.status}: ${(await rows.text()).slice(0, 150)}`);
rows = await rows.json();

if (rows.length < objetivo) {
  const fallback = await fetch(
    `${base}/rest/v1/companies?select=id,name,city,whatsapp,phone,data_quality_score&whatsapp=not.is.null&order=data_quality_score.desc.nullslast&limit=800`,
    { headers: H },
  );
  if (fallback.ok) {
    const ya = new Set(rows.map((x) => x.company_id).filter(Boolean));
    for (const c of (await fallback.json()) || []) {
      if (!ya.has(c.id)) {
        rows.push({ company_id: c.id, status: 'SEED', companies: c });
        ya.add(c.id);
      }
    }
  }
}

for (const row of rows) {
  if (nuevas.length >= Math.max(0, objetivo)) break;
  const c = row.companies || {};
  const tel = digits(c.whatsapp || c.phone);
  if (tel.length < 10) continue;
  if (telEnCola.has(tel)) continue;
  telEnCola.add(tel);
  nuevas.push({
    project: 'guaki',
    id: `wa-${crypto.randomBytes(6).toString('hex')}`,
    name: (c.name || 'Negocio sin nombre').slice(0, 90),
    zone: (c.city || '').slice(0, 60),
    phone: `+${tel}`,
    wa_link: `https://wa.me/${tel}`,
    status: 'pending',
    notes: '',
    created_at: ahora,
    updated_at: ahora,
  });
  if (nuevas.length >= Math.max(0, objetivo)) break;
}

const pendGuaki = items.filter((i) => i.project === 'guaki' && i.status === 'pending').length;

console.log(JSON.stringify({
  dry,
  items_antes: items.length,
  pendientes_guaki_antes: pendGuaki,
  leads_open_con_whatsapp: (rows || []).filter((x) => x.companies && x.companies.whatsapp).length,
  nuevas_agregadas: nuevas.length,
  nuevas: nuevas.map((x) => `${x.name} (${x.zone || 's/zona'}) ${x.wa_link}`),
}, null, 2));

if (!dry && nuevas.length > 0) await writeQueue(items);
