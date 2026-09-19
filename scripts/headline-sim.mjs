import fs from 'node:fs';

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

const VARIANTES = {
  A: { h1: 'El estándar, enseñado.', sub: 'Técnica de élite y negocio real. No se improvisan: se aprenden.' },
  B: { h1: 'Precisión, no promesas.', sub: 'Bioseguridad, arquitectura y pricing: el oficio completo, enseñado con estándar.' },
  C: { h1: 'Se cobra bien porque se hace bien.', sub: 'Formación de técnica Y de negocio para manicuristas que quieren vivir de esto.' },
};

// Personas sinteticas del ICP documentado en BRENDA_BIBLE (estudiantes y
// profesionales de belleza en Colombia). Son agentes de prueba, no datos reales.
const PERSONAS = [
  { id: 'p01', perfil: 'Laura, 22, Bogotá. Autodidacta de uñas con tutoriales de YouTube. Quiere sus primeras clientas que paguen lo justo. Desconfía de los cursos caros de Instagram.' },
  { id: 'p02', perfil: 'Daniela, 29, Medellín. Manicurista hace 2 años, atiende en su casa. Sabe técnica pero cobra mal y no sabe poner precios. Busca formalizarse.' },
  { id: 'p03', perfil: 'Sofía, 34, Cali. Exenfermera que quiere transicionar al mundo de las uñas. Valora higiene, bioseguridad y método serio. Le asusta lo "influencer".' },
  { id: 'p04', perfil: 'Yeimi, 26, Caracas radicada en Bogotá. Uñas esculpidas autodidacta, clientas informales. Quiere aprender a facturar y sostener agenda.' },
  { id: 'p05', perfil: 'Camila, 19, Pereira. Está decidiendo si estudiar uñas o estética. No tiene dinero para un curso caro. Quiere ver de antemano cómo es el nivel.' },
  { id: 'p06', perfil: 'Andrea, 31, Bogotá. Nail tech con cabina alquilada. Le sobra técnica, le falta cliente recurrente y margen. Compra formación por Instagram.' },
  { id: 'p07', perfil: 'Valentina, 24, Envigado. Empieza con kit básico. No entiende palabras como "arquitectura" o "pricing". Si no lo entiende en 3 segundos, sigue de largo.' },
  { id: 'p08', perfil: 'Mariana, 27, Bucaramanga. Manicurista que sufrió quemaduras a clientas por esterilización mal entendida. La bioseguridad es su dolor y su orgullo.' },
  { id: 'p09', perfil: 'Katherine, 33, Miami, origen colombiano. Quiere formarse en uñas para trabajar allá. Busca un método transferible, no trucos.' },
  { id: 'p10', perfil: 'Luisa, 41, Bogotá. Reconversión laboral después de 15 años en oficina. Busca estructura, paso a paso, y que no la traten de ingenua.' },
  { id: 'p11', perfil: 'Shirley, 25, Soacha. Tiene clientas pero regatea todo el mundo. Cree que su problema es el mercado, no su precio.' },
  { id: 'p12', perfil: 'Paula, 30, Medellín. Diseñadora que hace uñas como hobby rentable. Le atrae lo estético-editorial; le repele lo gritón de ofertas.' },
];

async function chat(messages, maxTokens = 1100) {
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

function barajarOrden(seedIdx) {
  const keys = ['A', 'B', 'C'];
  // permutacion deterministica por persona para matar el sesgo de posicion
  const perms = [['A', 'B', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B'], ['A', 'C', 'B'], ['C', 'B', 'A'], ['B', 'A', 'C']];
  return perms[seedIdx % perms.length];
}

async function testearPersona(p, idx) {
  const orden = barajarOrden(idx);
  const bloque = orden
    .map((k) => `OPCION ${k}:\n  Titular: "${VARIANTES[k].h1}"\n  Sub: "${VARIANTES[k].sub}"`)
    .join('\n\n');
  const system =
    'Eres un panel de consumidoras sinteticas para pruebas de neuromarketing. Respondes EN PERSONA, con la cabeza de esa mujer colombiana, sin complacer. Solo JSON valido.';
  const user = `Persona: ${p.perfil}

Estas scrolleando Instagram y ves la portada de una academia de formacion de uñas (fondo: macro editorial de gel berry sobre negro, tipografia serif elegante, sin caras, sin precios, sin testimonios). Tres versiones posibles del titular + sub. Responde JSON:

{
 "reacciones": { "${orden[0]}": "frase de 1 linea en primera persona", "${orden[1]}": "...", "${orden[2]}": "..." },
 "scores": {
   "${orden[0]}": { "parada": 0-10, "autoridad": 0-10, "comprension": 0-10, "intencion": 0-10 },
   "${orden[1]}": { "parada": 0-10, "autoridad": 0-10, "comprension": 0-10, "intencion": 0-10 },
   "${orden[2]}": { "parada": 0-10, "autoridad": 0-10, "comprension": 0-10, "intencion": 0-10 }
 },
 "ranking": ["primera", "segunda", "tercera"],
 "que_repele": "que suena a mentira, a vago o no se entiende (o none)"
}

${bloque}`;
  const out = await chat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);
  return { persona: p.id, perfil: p.perfil, orden, ...out };
}

const resultados = [];
for (let i = 0; i < PERSONAS.length; i += 3) {
  const lote = PERSONAS.slice(i, i + 3).map((p, j) => testearPersona(p, i + j));
  // eslint-disable-next-line no-await-in-loop
  const res = await Promise.allSettled(lote);
  for (const r of res) if (r.status === 'fulfilled') resultados.push(r.value);
  else console.error('fallo persona:', String(r.reason).slice(0, 140));
  // eslint-disable-next-line no-await-in-loop
  await new Promise((ok) => setTimeout(ok, 1500));
}

// agregacion
const dims = ['parada', 'autoridad', 'comprension', 'intencion'];
const agg = {};
for (const k of Object.keys(VARIANTES)) {
  agg[k] = { parada: [], autoridad: [], comprension: [], intencion: [] };
}
const primeraVez = {};
for (const r of resultados) {
  for (const k of Object.keys(r.scores || {})) {
    for (const d of dims) if (typeof r.scores[k]?.[d] === 'number') agg[k][d].push(r.scores[k][d]);
  }
  if (!primeraVez[r.ranking?.[0]]) primeraVez[r.ranking?.[0]] = 0;
  if (r.ranking?.[0]) primeraVez[r.ranking[0]] += 1;
}
const prom = (xs) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '—');

const L = [];
L.push(`# SIMULACIÓN — Headlines de autoridad Brenda (Run #1 con API Qwen)`);
L.push('');
L.push(`Generado: ${new Date().toISOString()} · Modelo: qwen-plus (DashScope) · ${resultados.length} personas sintéticas del ICP de la biblia · orden de variantes barajado por persona (anti-sesgo de posición).`);
L.push('');
L.push('## Variantes');
for (const [k, v] of Object.entries(VARIANTES)) L.push(`- **${k}** — "${v.h1}" / "${v.sub}"`);
L.push('');
L.push('## Resultados agregados (0-10)');
L.push('');
L.push('| Variante | Parada (scroll-stop) | Autoridad | Comprensión | Intención | Primeras veces #1 |');
L.push('|---|---|---|---|---|---|');
for (const k of Object.keys(VARIANTES)) {
  L.push(`| ${k} | ${prom(agg[k].parada)} | ${prom(agg[k].autoridad)} | ${prom(agg[k].comprension)} | ${prom(agg[k].intencion)} | ${primeraVez[k] || 0} |`);
}
L.push('');
L.push('## Reacciones destacadas');
for (const r of resultados) {
  L.push(`- **${r.persona}** (${r.perfil.split('.')[1]?.trim().slice(0, 46) || r.perfil.slice(0, 46)}…): ${Object.entries(r.reacciones || {}).map(([k, v]) => `${k}: "${v}"`).join(' · ')}${r.que_repele && r.que_repele !== 'none' ? ` | ⚠️ ${r.que_repele}` : ''}`);
}
L.push('');
fs.writeFileSync('C:/Users/edwin/Documents/Default Project/EVIDENCE/SIMULACION_BRENDA_HEADLINES_v1.md', L.join('\n'), 'utf8');
console.log('reporto:', L.join('\n').slice(0, 1400));
