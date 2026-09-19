import fs from 'node:fs';

// Simulador generico de copy con personas sinteticas (API Qwen).
// Uso: node scripts/sim-copy.mjs <config.json>
// Config: { brand, scene, variantes: {A:{h1,sub},...}, personas: [{id,perfil}], output }

const cfgPath = process.argv[2];
if (!cfgPath) {
  console.error('uso: node scripts/sim-copy.mjs <config.json>');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const env = Object.fromEntries(
  fs
    .readFileSync('C:/Users/edwin/Documents/Trinidad/guaki/.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
);
const KEY = env.DASHSCOPE_API_KEY;
const BASE = env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
if (!KEY) throw new Error('sin DASHSCOPE_API_KEY');

const KEYS = Object.keys(cfg.variantes);

async function chat(messages, maxTokens = 1200) {
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'qwen-plus', messages, temperature: 0.8, max_tokens: maxTokens, response_format: { type: 'json_object' } }),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error(`qwen ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return JSON.parse(j.choices[0].message.content);
}

function barajar(seedIdx) {
  if (KEYS.length === 3) {
    const perms = [['A', 'B', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B'], ['A', 'C', 'B'], ['C', 'B', 'A'], ['B', 'A', 'C']];
    return perms[seedIdx % perms.length];
  }
  return [...KEYS];
}

async function testearPersona(p, idx) {
  const orden = barajar(idx);
  const bloque = orden.map((k) => `OPCION ${k}:\n  Titular: "${cfg.variantes[k].h1}"\n  Sub: "${cfg.variantes[k].sub}"`).join('\n\n');
  const lista = orden.map((k) => `"${k}"`).join(', ');
  const system = `Eres un panel de consumidores sinteticos para pruebas de neuromarketing. Respondes EN PERSONA con la cabeza de esa persona, sin complacer. Solo JSON valido.`;
  const user = `Persona: ${p.perfil}

Contexto: ${cfg.scene}

Versiones posibles del titular + sub. Responde JSON con esta forma exacta:
{
 "reacciones": { ${orden.map((k) => `"${k}": "frase de 1 linea en primera persona"`).join(', ')} },
 "scores": { ${orden.map((k) => `"${k}": { "parada": 0, "autoridad": 0, "comprension": 0, "intencion": 0 }`).join(', ')} },
 "ranking": [${lista}],
 "que_repele": "que suena a mentira, a vago o no se entiende (o none)"
}

${bloque}`;
  const out = await chat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);
  return { persona: p.id, perfil: p.perfil, orden, ...out };
}

console.log(`[${cfg.brand}] ${cfg.personas.length} personas x ${KEYS.length} variantes...`);
const resultados = [];
for (let i = 0; i < cfg.personas.length; i += 3) {
  const lote = cfg.personas.slice(i, i + 3).map((p, j) => testearPersona(p, i + j));
  // eslint-disable-next-line no-await-in-loop
  const res = await Promise.allSettled(lote);
  for (const r of res) if (r.status === 'fulfilled') resultados.push(r.value);
  else console.error('fallo:', String(r.reason).slice(0, 140));
  // eslint-disable-next-line no-await-in-loop
  await new Promise((ok) => setTimeout(ok, 1500));
}

const dims = ['parada', 'autoridad', 'comprension', 'intencion'];
const agg = {};
for (const k of KEYS) agg[k] = { parada: [], autoridad: [], comprension: [], intencion: [] };
const primeras = {};
for (const r of resultados) {
  for (const k of Object.keys(r.scores || {})) {
    for (const d of dims) if (typeof r.scores[k]?.[d] === 'number') agg[k][d].push(r.scores[k][d]);
  }
  if (r.ranking?.[0]) primeras[r.ranking[0]] = (primeras[r.ranking[0]] || 0) + 1;
}
const prom = (xs) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '—');

const L = [];
L.push(`# SIMULACIÓN DE COPY — ${cfg.brand.toUpperCase()} (API Qwen)`);
L.push('');
L.push(`Generado: ${new Date().toISOString()} · qwen-plus · ${resultados.length} personas sintéticas del ICP · orden barajado por persona. Contexto: ${cfg.scene}`);
L.push('');
L.push('## Variantes');
for (const [k, v] of Object.entries(cfg.variantes)) L.push(`- **${k}** — "${v.h1}" / "${v.sub}"`);
L.push('');
L.push('## Resultados agregados (0-10)');
L.push('');
L.push('| Variante | Parada | Autoridad | Comprensión | Intención | Veces #1 |');
L.push('|---|---|---|---|---|---|');
for (const k of KEYS) L.push(`| ${k} | ${prom(agg[k].parada)} | ${prom(agg[k].autoridad)} | ${prom(agg[k].comprension)} | ${prom(agg[k].intencion)} | ${primeras[k] || 0} |`);
L.push('');
L.push('## Reacciones');
for (const r of resultados) {
  const seg = r.perfil.split(',')[0];
  L.push(`- **${r.persona}** (${seg}): ${Object.entries(r.reacciones || {}).map(([k, v]) => `${k}: "${v}"`).join(' · ')}${r.que_repele && r.que_repele !== 'none' ? ` | ⚠️ ${r.que_repele}` : ''}`);
}
L.push('');
fs.writeFileSync(cfg.output, L.join('\n'), 'utf8');
console.log(`reporte -> ${cfg.output}`);
console.log(L.slice(6, 16).join('\n'));
