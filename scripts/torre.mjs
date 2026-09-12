import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TRINIDAD = 'C:/Users/edwin/Documents/Trinidad';
const BOARDS = ['guaki', 'veyra', 'brenda', 'cveliz', 'sielan', 'lanza', 'atlas', 'default'];
const AGENT_PREFIX = /^(IGP\d|AUD-|WEB\d|SEO\d|OPS\d|AB\d|P0-|TORRE\d|Lote\s?\d)/;
const HUMAN_RE = /HUMANO|EDWIN|HUMANAS/i;

function run(cmd, timeout = 120000) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout, windowsHide: true, maxBuffer: 20 * 1024 * 1024 });
  } catch {
    return null;
  }
}

function boardsData() {
  const out = {};
  for (const b of BOARDS) {
    const raw = run(`hermes kanban --board ${b} list --json`);
    if (!raw) { out[b] = null; continue; }
    try { out[b] = JSON.parse(raw); } catch { out[b] = null; }
  }
  return out;
}

async function probe(url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(25000) });
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: String(e.message || e).slice(0, 80) };
  }
}

function uncheckedMd(file, label) {
  try {
    return fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('- [ ]'))
      .map((l) => `   ${l.replace('- [ ]', '- [ ]').trim()} _(${label})_`);
  } catch {
    return [];
  }
}

function countFiles(dir, ext) {
  let n = 0;
  try {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(ext)) n += 1;
    }
  } catch {}
  return n;
}

const boards = boardsData();

const postizConfig = (() => {
  try {
    return JSON.parse(fs.readFileSync(`${TRINIDAD}/GUAKI_CREATIVES/_pipeline/postiz/config.json`, 'utf8'));
  } catch {
    return {};
  }
})();

const postizHeaders = postizConfig.apiKey ? { Authorization: postizConfig.apiKey } : {};
const postizPing = await probe('http://127.0.0.1:4007/api/public/v1/is-connected', { headers: postizHeaders });
let channels = null;
if (postizConfig.apiKey) {
  try {
    channels = await (await fetch('http://127.0.0.1:4007/api/public/v1/integrations', { headers: postizHeaders, signal: AbortSignal.timeout(25000) })).json();
  } catch { channels = null; }
}

const docker = run('docker ps --format "{{.Names}}: {{.Status}}"', 60000);
const postizContainers = (docker || '')
  .split(/\r?\n/)
  .filter((l) => /postiz|temporal|spotlight/.test(l))
  .map((l) => `- \`${l}\``);

const probes = {
  'guaki.online /': await probe('https://guaki.online/'),
  'guaki.online /register': await probe('https://guaki.online/register'),
  'guaki.online /api/health': await probe('https://guaki.online/api/health'),
  'guaki.online /unete': await probe('https://guaki.online/unete'),
  'veyrasoluciones.com': await probe('https://veyrasoluciones.com/'),
  'Torre Mapache (Vercel)': await probe('https://mapache-kappa.vercel.app/torre-control'),
  'Postiz API local': postizPing,
};

const humans = [];
const leadCounts = {};
for (const [board, tasks] of Object.entries(boards)) {
  if (!tasks) continue;
  for (const t of tasks) {
    if (t.status === 'done' || t.status === 'archived') continue;
    if (/^LEAD /.test(t.title)) {
      const kind = t.title.includes('wa-mde') ? 'LEAD WhatsApp Medellín' : t.title.includes('wa-ccs') ? 'LEAD WhatsApp Caracas' : 'LEAD otros';
      leadCounts[kind] = (leadCounts[kind] || 0) + 1;
      continue;
    }
    if (HUMAN_RE.test(t.title) || (!t.assignee && !AGENT_PREFIX.test(t.title))) {
      humans.push({ board, id: t.id, status: t.status, title: t.title });
    }
  }
}

const igChecklist = uncheckedMd('C:/Users/edwin/Documents/Default Project/EVIDENCE/GUAKI_INSTAGRAM_SETUP_v1.md', 'setup Postiz');
const accionesChecklist = uncheckedMd(`${TRINIDAD}/ACCIONES_EDWIN.md`, 'ACCIONES_EDWIN');

const postsCount = countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-1_dias-01-03/posts`, '.jpg')
  + countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-2_dias-04-07/posts`, '.jpg')
  + countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-3_dias-08-11/posts`, '.jpg');
const storiesCount = countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-2_dias-04-07/historias`, '.jpg');
const reelsCount = countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/reels`, '.mp4');
const draftsCount = countFiles(`${TRINIDAD}/GUAKI_CREATIVES/_pipeline/postiz/drafts`, '.json');

const evidence = (() => {
  try {
    const dir = 'C:/Users/edwin/Documents/Default Project/EVIDENCE';
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.m - a.m)
      .slice(0, 8)
      .map((e) => `- [${e.f}](EVIDENCE/${e.f}) · ${new Date(e.m).toISOString().slice(0, 10)}`);
  } catch {
    return [];
  }
})();

const L = [];
L.push('# 🗼 TORRE DE CONTROL — Trinidad');
L.push('');
L.push('> ⚙️ **No editar a mano.** Se regenera con: `node C:/Users/edwin/Documents/Trinidad/guaki/scripts/torre.mjs` (cron Hermes diario 07:00).');
L.push(`Generada: ${new Date().toLocaleString('es-CO')} (Bogotá) · Fuentes vivas: 8 boards Hermes + sondas HTTP + docker + Postiz + EVIDENCE`);
L.push('');
L.push('---');
L.push('');
L.push('## 🧑 COLA HUMANA ( Edwin — ordenada por lo que destraba misiones )');
L.push('');
L.push('### 1. Instagram/Meta — destraba IGP2 (publicar 11 borradores), IGP3 (reels) y AB1');
if (channels && Array.isArray(channels) && channels.length) {
  L.push(`   ✅ Canal IG detectado: ${channels.map((c) => `${c.name} (${c.identifier})`).join(', ')} — ya se puede correr IGP2`);
} else {
  L.push('   ⬜ Sin canal IG conectado aún (`channels=[]`). Pasos faltantes:');
  L.push(...(igChecklist.length ? igChecklist : ['   - [ ] (guía EVIDENCE/GUAKI_INSTAGRAM_SETUP_v1.md no tiene items abiertos)']));
}
L.push('');
L.push('### 2. Otras acciones humanas abiertas (de los boards)');
for (const h of humans) L.push(`- [${h.board}] \`${h.id}\` (${h.status}) — ${h.title}`);
for (const [k, v] of Object.entries(leadCounts)) L.push(`- [guaki] **${v}** tarjetas ${k} (rutina diaria 15/día según KIT_OUTBOUND)`);
L.push('');
L.push('### 3. Legado ACCIONES_EDWIN.md');
L.push(...(accionesChecklist.length ? accionesChecklist : ['   (sin ítems abiertos)']));
L.push('');
L.push('---');
L.push('');
L.push('## 🌡️ PRODUCCIÓN EN VIVO (sondeada ahora)');
L.push('');
L.push('| Objetivo | Estado |');
L.push('|---|---|');
for (const [name, p] of Object.entries(probes)) {
  const emoji = p.ok && p.status < 400 ? '🟢' : p.ok && p.status === 401 ? '🟢 (401=api viva sin key)' : p.ok ? `🟡 HTTP ${p.status}` : '🔴';
  L.push(`| ${name} | ${emoji}${p.ok ? ` ${p.status}` : ` ${p.error}`} |`);
}
L.push('');
if (postizContainers.length) {
  L.push('**Stack Postiz (docker local):**');
  L.push(...postizContainers);
} else {
  L.push('🔴 **Stack Postiz caído** — `cd Trinidad/postiz; docker compose up -d` (y si el API no responde a los 2 min: `docker exec postiz pm2 restart backend`).');
}
L.push('');
L.push('---');
L.push('');
L.push('## 📦 TABLEROS (abiertas / total)');
L.push('');
for (const [board, tasks] of Object.entries(boards)) {
  if (!tasks) { L.push(`### ${board}: 🔴 sin datos`); L.push(''); continue; }
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'archived' && !/^LEAD /.test(t.title));
  const leads = tasks.filter((t) => /^LEAD /.test(t.title) && t.status !== 'done' && t.status !== 'archived').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  L.push(`### ${board}: ${open.length} abiertas${leads ? ` + ${leads} LEADs` : ''} · ${done} done`);
  for (const t of open) {
    L.push(`- \`${t.id}\` **[${t.status}]** ${t.title}${t.assignee ? ` → ${t.assignee}` : ''}`);
  }
  L.push('');
}
L.push('---');
L.push('');
L.push('## 🎨 PIPELINE DE CONTENIDO IG');
L.push(`- Piezas listas: **${postsCount} posts** 1080×1350 + **${storiesCount} historias** · Reels montados: **${reelsCount}** (sin auditar — tarjeta AUD-R) · Drafts Postiz: **${draftsCount}**`);
L.push(`- B-roll: ${countFiles(`${TRINIDAD}/GUAKI_CREATIVES/02_VIDEOS_BROLL`, '.mp4')} clips en 02_VIDEOS_BROLL`);
L.push('- Lote 4 (días 12-15): pendiente por decisión de Edwin');
L.push('');
L.push('---');
L.push('');
L.push('## 🧾 EVIDENCIA RECIENTE');
L.push(...evidence);
L.push('');

fs.writeFileSync(`${TRINIDAD}/TORRE.md`, L.join('\n'), 'utf8');
console.log(`TORRE.md generado: ${L.length} lineas -> ${TRINIDAD}/TORRE.md`);
