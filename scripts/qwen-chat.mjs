/**
 * Guaki Qwen Chat — consulta rápida a Qwen (Model Studio) para copy/variantes.
 *
 * Uso:
 *   node --env-file=.env.local scripts/qwen-chat.mjs "<prompt>" [--out archivo.md] [--model qwen-plus] [--system "..."]
 *
 * Requiere DASHSCOPE_API_KEY (y opcional DASHSCOPE_BASE_URL) en el entorno/.env.local.
 */

import fs from 'node:fs';

const DEFAULT_SYSTEM =
  'Eres copywriter senior de Guaki, un directorio de negocios locales en Colombia y Venezuela. ' +
  'Escribes en espanol neutro, calido y concreto. REGLA ABSOLUTA: no inventar datos, testimonios, ' +
  'cifras ni resultados. Devuelve solo lo pedido, sin preambulos.';

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i].startsWith('--')) {
    flags[args[i].slice(2)] = args[i + 1];
    i += 1;
  } else {
    positional.push(args[i]);
  }
}

const prompt = positional[0];
if (!prompt) {
  console.error('Uso: node --env-file=.env.local scripts/qwen-chat.mjs "<prompt>" [--out archivo] [--model qwen-plus]');
  process.exit(1);
}

const key = (process.env.DASHSCOPE_API_KEY || '').trim();
const base = (process.env.DASHSCOPE_BASE_URL || 'https://ws-545uid40zuoucjxh.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
if (!key) {
  console.error('Falta DASHSCOPE_API_KEY');
  process.exit(1);
}

const response = await fetch(`${base}/chat/completions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: flags.model || 'qwen-plus',
    temperature: 0.85,
    max_tokens: 1400,
    messages: [
      { role: 'system', content: flags.system || DEFAULT_SYSTEM },
      { role: 'user', content: prompt },
    ],
  }),
});

const data = await response.json().catch(() => null);
if (!response.ok) {
  console.error('error', response.status, JSON.stringify(data).slice(0, 300));
  process.exit(1);
}

const text = data?.choices?.[0]?.message?.content?.trim() || '';
if (flags.out) {
  fs.writeFileSync(flags.out, text, 'utf8');
  console.log(`escrito ${flags.out} (${text.length} chars)`);
} else {
  console.log(text);
}
