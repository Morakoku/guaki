import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.POSTIZ_URL || 'http://127.0.0.1:4007/api';
const CONFIG_FILE =
  process.env.POSTIZ_CONFIG ||
  'C:/Users/edwin/Documents/Trinidad/GUAKI_CREATIVES/_pipeline/postiz/config.json';

function apiKey() {
  if (process.env.POSTIZ_API_KEY) return process.env.POSTIZ_API_KEY;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')).apiKey;
  } catch {
    return undefined;
  }
}

async function api(pathname, options = {}) {
  const key = apiKey();
  const headers = { ...(options.headers || {}) };
  if (key) headers.Authorization = key;
  const res = await fetch(BASE + pathname, { ...options, headers, signal: AbortSignal.timeout(30000) });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en ${pathname}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function uploadMedia(filePath) {
  const buffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append(
    'file',
    new Blob([buffer], {
      type: path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg',
    }),
    path.basename(filePath)
  );
  const res = await api('/public/v1/upload', { method: 'POST', body: form });
  const media = res.media ? res.media[0] : res;
  return { id: media.id, path: media.path };
}

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) flags[m[1]] = m[2] === undefined ? true : m[2];
    else rest.push(a);
  }
  return { flags, rest };
}

const [command, ...argv] = process.argv.slice(2);
const { flags, rest } = parseArgs(argv);

if (command === 'ping') {
  const key = apiKey();
  console.log(`Postiz base: ${BASE}`);
  if (!key) {
    console.log('sin API key todavia: la app responde =', JSON.stringify(await api('/public/v1/is-connected').catch((e) => e.message)));
    console.log('Siguiente paso: registrar owner en http://localhost:4007, crear API key (Settings > General) y guardarla en', CONFIG_FILE);
  } else {
    console.log('autenticado:', JSON.stringify(await api('/public/v1/is-connected')));
  }
} else if (command === 'channels') {
  console.log(JSON.stringify(await api('/public/v1/integrations'), null, 2));
} else if (command === 'upload') {
  if (!rest[0]) throw new Error('uso: postiz-client.mjs upload <archivo> [--save-payload=<json>]');
  const media = await uploadMedia(rest[0]);
  console.log(JSON.stringify(media));
  if (flags['save-payload']) {
    const payloadFile = flags['save-payload'];
    const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));
    payload._mediaCache = { ...(payload._mediaCache || {}), [path.resolve(rest[0])]: media };
    fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2));
  }
} else if (command === 'list') {
  const start = flags.start || new Date(Date.now() - 30 * 864e5).toISOString();
  const end = flags.end || new Date(Date.now() + 60 * 864e5).toISOString();
  console.log(JSON.stringify(await api(`/public/v1/posts?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`), null, 2));
} else if (command === 'send') {
  const draftFile = path.resolve(rest[0] || '');
  const draft = JSON.parse(fs.readFileSync(draftFile, 'utf8'));
  const cache = draft._mediaCache || {};
  const payload = {
    type: draft.type || 'draft',
    shortLink: draft.shortLink ?? false,
    date: draft.date || new Date(Date.now() + 864e5).toISOString().slice(0, 19),
    tags: draft.tags || [],
    posts: [],
  };
  for (const post of draft.posts || []) {
    const value = [];
    for (const item of post.items || []) {
      const image = [];
      for (const imgPath of item.images || []) {
        const abs = path.resolve(imgPath);
        if (flags['dry-run']) {
          image.push({ id: 'dry-run', path: abs });
          continue;
        }
        if (!cache[abs]) cache[abs] = await uploadMedia(abs);
        image.push(cache[abs]);
      }
      value.push({ content: item.caption, image });
    }
    payload.posts.push({
      integration: post.integration,
      group: draft.group || path.basename(draftFile, '.json'),
      value,
    });
  }
  if (flags['dry-run']) {
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }
  fs.writeFileSync(draftFile, JSON.stringify({ ...draft, _mediaCache: cache }, null, 2));  const result = await api('/public/v1/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log('creado en Postiz:', JSON.stringify(result));
} else {
  console.log('comandos: ping | channels | upload <archivo> | send <draft.json> [--dry-run] | list [--start --end]');
  process.exit(1);
}
