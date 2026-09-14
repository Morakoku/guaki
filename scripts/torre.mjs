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
      .map((l) => ({ text: l.replace('- [ ]', '').trim(), source: label }));
  } catch {
    return [];
  }
}

function countFiles(dir, ext) {
  let n = 0;
  try {
    for (const f of fs.readdirSync(dir)) if (f.endsWith(ext)) n += 1;
  } catch {}
  return n;
}

// ---------- recoleccion ----------
const boardsRaw = {};
for (const b of BOARDS) {
  const raw = run(`hermes kanban --board ${b} list --json`);
  try {
    boardsRaw[b] = raw ? JSON.parse(raw) : null;
  } catch {
    boardsRaw[b] = null;
  }
}

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
    channels = await (
      await fetch('http://127.0.0.1:4007/api/public/v1/integrations', { headers: postizHeaders, signal: AbortSignal.timeout(25000) })
    ).json();
    if (!Array.isArray(channels)) channels = null;
  } catch {
    channels = null;
  }
}

// Lane de contenido: programado vs publicado (Postiz). Degradacion honesta cuando
// no hay API key, el backend local no responde o aun no hay canal conectado.
let postizPosts = null;
let postizPostsError = null;
if (postizConfig.apiKey && postizPing.ok) {
  const start = new Date(Date.now() - 30 * 864e5).toISOString();
  const end = new Date(Date.now() + 60 * 864e5).toISOString();
  try {
    const res = await fetch(
      `http://127.0.0.1:4007/api/public/v1/posts?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`,
      { headers: postizHeaders, signal: AbortSignal.timeout(25000) },
    );
    const body = await res.json();
    postizPosts = Array.isArray(body) ? body : Array.isArray(body?.posts) ? body.posts : null;
    if (!postizPosts) postizPostsError = `HTTP ${res.status} formato inesperado`;
  } catch (e) {
    postizPostsError = String(e?.message || e).slice(0, 80);
  }
}

const docker = run('docker ps --format "{{.Names}}: {{.Status}}"', 60000);
const postizContainers = (docker || '').split(/\r?\n/).filter((l) => /postiz|temporal|spotlight/.test(l));

const probes = {
  'guaki.online /': await probe('https://guaki.online/'),
  'guaki.online /register': await probe('https://guaki.online/register'),
  'guaki.online /api/health': await probe('https://guaki.online/api/health'),
  'guaki.online /unete': await probe('https://guaki.online/unete'),
  'veyrasoluciones.com': await probe('https://veyrasoluciones.com/'),
  'Torre Mapache (Vercel)': await probe('https://mapache-kappa.vercel.app/torre-control'),
  'Postiz API local': postizPing,
};

const boards = {};
const humans = [];
const leadCounts = {};
for (const [board, tasks] of Object.entries(boardsRaw)) {
  if (!tasks) {
    boards[board] = { error: true };
    continue;
  }
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'archived' && !/^LEAD /.test(t.title));
  const leads = tasks.filter((t) => /^LEAD /.test(t.title) && t.status !== 'done' && t.status !== 'archived').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  boards[board] = {
    open: open.length,
    done,
    leads,
    items: open.map((t) => ({ id: t.id, status: t.status, title: t.title, assignee: t.assignee || null })),
  };
  for (const t of tasks) {
    if (t.status === 'done' || t.status === 'archived') continue;
    if (/^LEAD /.test(t.title)) {
      const kind = t.title.includes('wa-mde') ? 'LEAD WhatsApp Medellin' : t.title.includes('wa-ccs') ? 'LEAD WhatsApp Caracas' : 'LEAD otros';
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

const postizContent = (() => {
  if (!postizConfig.apiKey) return { state: 'not_configured', scheduled: null, published: null, detail: 'sin API key de Postiz' };
  if (!postizPosts) return { state: 'unavailable', scheduled: null, published: null, detail: postizPostsError || 'Postiz local sin respuesta' };
  const buckets = { published: 0, scheduled: 0, draft: 0, other: 0 };
  for (const p of postizPosts) {
    const s = String(p?.state || p?.status || p?.statusType || '').toLowerCase();
    if (s.includes('publish')) buckets.published += 1;
    else if (s.includes('queue') || s.includes('schedul')) buckets.scheduled += 1;
    else if (s.includes('draft')) buckets.draft += 1;
    else buckets.other += 1;
  }
  return { state: 'ok', scheduled: buckets.scheduled, published: buckets.published, draft: buckets.draft, other: buckets.other, total: postizPosts.length };
})();

const content = {
  posts: countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-1_dias-01-03/posts`, '.jpg')
    + countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-2_dias-04-07/posts`, '.jpg')
    + countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-3_dias-08-11/posts`, '.jpg'),
  stories: countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/lote-2_dias-04-07/historias`, '.jpg'),
  reels: countFiles(`${TRINIDAD}/GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/reels`, '.mp4'),
  drafts: countFiles(`${TRINIDAD}/GUAKI_CREATIVES/_pipeline/postiz/drafts`, '.json'),
  broll: countFiles(`${TRINIDAD}/GUAKI_CREATIVES/02_VIDEOS_BROLL`, '.mp4'),
  scheduled: postizContent.scheduled,
  published: postizContent.published,
  postiz_posts: postizContent,
};

const evidence = (() => {
  try {
    const dir = 'C:/Users/edwin/Documents/Default Project/EVIDENCE';
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.m - a.m)
      .slice(0, 8)
      .map((e) => ({ file: e.f, date: new Date(e.m).toISOString().slice(0, 10) }));
  } catch {
    return [];
  }
})();

const data = {
  generated_at: new Date().toISOString(),
  generator: 'guaki/scripts/torre.mjs',
  boards,
  human_queue: humans,
  lead_counts: leadCounts,
  ig_checklist_open: igChecklist,
  acciones_open: accionesChecklist,
  probes,
  postiz: {
    api: postizPing,
    containers: postizContainers,
    channels: channels || [],
  },
  content,
  evidence,
};

// ---------- TORRE.json (consumido por el frontend de la Torre via torre-serve.mjs) ----------
const jsonPath = `${TRINIDAD}/TORRE.json`;
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

// ---------- TORRE.md (humano) ----------
const L = [];
L.push('# 🗼 TORRE DE CONTROL — Trinidad');
L.push('');
L.push('> ⚙️ **No editar a mano.** Se regenera con: `node C:/Users/edwin/Documents/Trinidad/guaki/scripts/torre.mjs` (cron Hermes diario 07:00).');
L.push('> 🌐 Versión en vivo en tu Torre: `mapache-kappa.vercel.app/torre-control` (sección Portafolio, datos desde Supabase).');
L.push(`Generada: ${new Date().toLocaleString('es-CO')} (Bogotá) · Fuentes vivas: 8 boards Hermes + sondas HTTP + docker + Postiz + EVIDENCE`);
L.push('');
L.push('---');
L.push('');
L.push('## 🧑 COLA HUMANA ( Edwin — ordenada por lo que destraba misiones )');
L.push('');
L.push('### 1. Instagram/Meta — destraba IGP2 (publicar 11 borradores), IGP3 (reels) y AB1');
if (data.postiz.channels.length) {
  L.push(`   ✅ Canal IG detectado: ${data.postiz.channels.map((c) => `${c.name} (${c.identifier})`).join(', ')} — ya se puede correr IGP2`);
} else {
  L.push('   ⬜ Sin canal IG conectado aún (`channels=[]`). Pasos faltantes:');
  for (const item of igChecklist) L.push(`   - [ ] ${item.text}`);
}
L.push('');
L.push('### 2. Otras acciones humanas abiertas (de los boards)');
for (const h of humans) L.push(`- [${h.board}] \`${h.id}\` (${h.status}) — ${h.title}`);
for (const [k, v] of Object.entries(leadCounts)) L.push(`- [guaki] **${v}** tarjetas ${k} (rutina diaria 15/día según KIT_OUTBOUND)`);
L.push('');
L.push('### 3. Legado ACCIONES_EDWIN.md');
if (accionesChecklist.length) for (const item of accionesChecklist) L.push(`   - [ ] ${item.text}`);
else L.push('   (sin ítems abiertos)');
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
  for (const c of postizContainers) L.push(`- \`${c}\``);
} else {
  L.push('🔴 **Stack Postiz caído** — `cd Trinidad/postiz; docker compose up -d` (y si el API no responde a los 2 min: `docker exec postiz pm2 restart backend`).');
}
L.push('');
L.push('---');
L.push('');
L.push('## 📦 TABLEROS (abiertas / total)');
L.push('');
for (const [board, b] of Object.entries(boards)) {
  if (!b || b.error) {
    L.push(`### ${board}: 🔴 sin datos`);
    L.push('');
    continue;
  }
  L.push(`### ${board}: ${b.open} abiertas${b.leads ? ` + ${b.leads} LEADs` : ''} · ${b.done} done`);
  for (const t of b.items) L.push(`- \`${t.id}\` **[${t.status}]** ${t.title}${t.assignee ? ` → ${t.assignee}` : ''}`);
  L.push('');
}
L.push('---');
L.push('');
L.push('## 🎨 PIPELINE DE CONTENIDO IG');
L.push(`- Piezas listas: **${content.posts} posts** 1080×1350 + **${content.stories} historias** · Reels montados: **${content.reels}** (auditados, falta audio — tarjeta REEL-AUD) · Drafts Postiz: **${content.drafts}**`);
const pp = content.postiz_posts || {};
L.push(pp.state === 'ok'
  ? `- Lane Postiz (programado vs publicado): **${pp.published} publicados** · **${pp.scheduled} programados** · ${pp.draft || 0} en borrador (ventana -30d/+60d)`
  : `- Lane Postiz (programado vs publicado): ⚪ sin datos — ${pp.detail || 'Postiz no configurado o inalcanzable'} (estado: ${pp.state || 'unknown'})`);
L.push(`- B-roll: ${content.broll} clips en 02_VIDEOS_BROLL`);
L.push('- Lote 4 (días 12-15): pendiente por decisión de Edwin');
L.push('');
L.push('---');
L.push('');
L.push('## 🧾 EVIDENCIA RECIENTE');
for (const e of evidence) L.push(`- [${e.file}](EVIDENCE/${e.file}) · ${e.date}`);
L.push('');

fs.writeFileSync(`${TRINIDAD}/TORRE.md`, L.join('\n'), 'utf8');
console.log(`TORRE.md (${L.length} lineas) + TORRE.json -> ${TRINIDAD}`);
console.log('Frontend: tu Torre (mapache-kappa.vercel.app/torre-control) lee http://127.0.0.1:7788/torre.json via torre-serve.mjs');
