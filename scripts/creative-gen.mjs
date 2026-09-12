/**
 * Guaki Creative Generator — Qwen + Wan (Alibaba Model Studio)
 *
 * Uso:
 *   node --env-file=.env.local scripts/creative-gen.mjs image "<prompt>" <salida.png> [--model wan2.2-t2i-flash] [--size 1152*1440]
 *   node --env-file=.env.local scripts/creative-gen.mjs video "<prompt>" <salida.mp4> [--model wan3.0-video] [--duration 5] [--ratio 9:16] [--resolution 480P]
 *
 * Requiere DASHSCOPE_API_KEY en el entorno (.env.local).
 * Genérico por diseño: nunca incluye claves en el código.
 */

import fs from 'node:fs';
import path from 'node:path';

const API_BASE = (process.env.DASHSCOPE_API_BASE || 'https://ws-545uid40zuoucjxh.ap-southeast-1.maas.aliyuncs.com/api/v1')
  .replace(/\/$/, '');
const KEY = (process.env.DASHSCOPE_API_KEY || '').trim();

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    } else {
      positional.push(argv[i]);
    }
  }
  return { flags, positional };
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.output?.task_id) {
    throw new Error(`create task failed http=${response.status} ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data.output.task_id;
}

async function poll(taskId, { timeoutMs, label }) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const data = await response.json().catch(() => null);
    const status = data?.output?.task_status;
    process.stdout.write(`\r${label}: ${status || 'UNKNOWN'} (${Math.round((Date.now() - startedAt) / 1000)}s)`);
    if (status === 'SUCCEEDED') {
      process.stdout.write('\n');
      return data.output;
    }
    if (status === 'FAILED' || status === 'CANCELED' || status === 'UNKNOWN') {
      process.stdout.write('\n');
      throw new Error(`${label} ${status}: ${JSON.stringify(data?.output || data).slice(0, 400)}`);
    }
  }
  throw new Error(`${label} timeout after ${Math.round(timeoutMs / 1000)}s`);
}

async function download(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download failed http=${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return buffer.length;
}

async function generateImage(prompt, outputPath, flags) {
  const model = flags.model || 'wan2.2-t2i-flash';
  const size = flags.size || '1152*1440';
  const taskId = await postJson(`${API_BASE}/services/aigc/text2image/image-synthesis`, {
    model,
    input: { prompt, negative_prompt: flags.negative || 'text, words, letters, watermark' },
    parameters: { size, n: 1, prompt_extend: true },
  });
  console.log(`image task: ${taskId} (model=${model} size=${size})`);
  const output = await poll(taskId, { timeoutMs: 5 * 60 * 1000, label: 'image' });
  const url = output?.results?.[0]?.url;
  if (!url) throw new Error(`no image url: ${JSON.stringify(output).slice(0, 300)}`);
  const bytes = await download(url, outputPath);
  console.log(`OK image -> ${outputPath} (${Math.round(bytes / 1024)} KB)`);
}

async function generateVideo(prompt, outputPath, flags) {
  const model = flags.model || 'wan3.0-video';
  const taskId = await postJson(`${API_BASE}/services/aigc/video-generation/video-synthesis`, {
    model,
    input: { prompt },
    parameters: {
      resolution: flags.resolution || '480P',
      ratio: flags.ratio || '9:16',
      duration: Number(flags.duration || 5),
      prompt_extend: true,
    },
  });
  console.log(`video task: ${taskId} (model=${model})`);
  const output = await poll(taskId, { timeoutMs: 15 * 60 * 1000, label: 'video' });
  const url = output?.video_url || output?.results?.video_url;
  if (!url) throw new Error(`no video url: ${JSON.stringify(output).slice(0, 300)}`);
  const bytes = await download(url, outputPath);
  console.log(`OK video -> ${outputPath} (${Math.round(bytes / 1024)} KB)`);
}

const { flags, positional } = parseArgs(process.argv.slice(2));
const [mode, prompt, output] = positional;

if (!KEY) {
  console.error('Falta DASHSCOPE_API_KEY (usa: node --env-file=.env.local scripts/creative-gen.mjs ...)');
  process.exit(1);
}
if (!mode || !prompt || !output || !['image', 'video'].includes(mode)) {
  console.error('Uso: creative-gen.mjs image|video "<prompt>" <salida> [--flags]');
  process.exit(1);
}

if (mode === 'image') {
  await generateImage(prompt, output, flags);
} else {
  await generateVideo(prompt, output, flags);
}
