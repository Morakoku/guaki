/**
 * Guaki Reel Builder — ensambla Reels 1080x1920 con texto quemado usando ffmpeg.
 *
 * Uso:
 *   node scripts/reel-builder.mjs <spec.json>
 *
 * Spec (JSON):
 * {
 *   "output": "C:/.../reel-1.mp4",
 *   "font": "C:/.../_pipeline/fonts/Outfit-Black.ttf",   // opcional
 *   "scenes": [
 *     { "clip": "C:/.../clip.mp4", "duration": 4, "text": "LINEA 1\nLINEA 2", "style": "hook" },
 *     { "clip": "...", "duration": 4, "text": "...", "style": "body" },
 *     { "clip": "...", "duration": 4, "text": "guaki.online", "style": "cta" }
 *   ]
 * }
 *
 * Estilos: hook (centro, 92px), body (centro-bajo, 64px), cta (centro, box cream).
 * Salida: mp4 H.264 1080x1920 30fps + faststart. Sin audio (para añadir audio trending en IG).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DEFAULT_FONT = 'C:/Users/edwin/Documents/Trinidad/GUAKI_CREATIVES/_pipeline/fonts/Outfit-Black.ttf';
const FONT_BOLD = 'C:/Users/edwin/Documents/Trinidad/GUAKI_CREATIVES/_pipeline/fonts/Outfit-Bold.ttf';

const specPath = process.argv[2];
if (!specPath) {
  console.error('Uso: node scripts/reel-builder.mjs <spec.json>');
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const workDir = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'guaki-reel-'));
const sceneFiles = [];

function esc(value) {
  return String(value).replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

function wrapText(text, maxCharsPerLine) {
  const lines = [];
  for (const rawLine of String(text).split('\n')) {
    const words = rawLine.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxCharsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines.join('\n');
}

const STYLES = {
  hook: { font: null, size: 78, maxChars: 19, color: '0xF4F7F2', box: '0x10241C@0.62', y: '(h-text_h)/2-150' },
  body: { font: FONT_BOLD, size: 56, maxChars: 27, color: '0xF4F7F2', box: '0x10241C@0.72', y: 'h-text_h-420' },
  cta: { font: null, size: 74, maxChars: 20, color: '0x17382D', box: '0xF4F7F2@0.96', y: '(h-text_h)/2-120' },
};

for (let index = 0; index < spec.scenes.length; index += 1) {
  const scene = spec.scenes[index];
  const out = path.join(workDir, `scene-${String(index + 1).padStart(2, '0')}.mp4`);
  const duration = scene.duration || 4;
  const font = scene.font || spec.font || DEFAULT_FONT;
  const textFile = path.join(workDir, `text-${index + 1}.txt`);
  const styleKey = scene.style || 'hook';
  const style = STYLES[styleKey] || STYLES.hook;
  fs.writeFileSync(textFile, scene.text ? wrapText(scene.text, style.maxChars) : '', 'utf8');

  const baseFilters = [
    'scale=1080:1920:force_original_aspect_ratio=increase',
    'crop=1080:1920',
    'fps=30',
  ];

  if (scene.text) {
    const drawtext =
      `drawtext=fontfile='${esc(scene.font || spec.font || style.font || DEFAULT_FONT)}':textfile='${esc(textFile)}':` +
      `fontcolor=${style.color}:fontsize=${style.size}:line_spacing=16:` +
      `box=1:boxcolor=${style.box}:boxborderw=34:x=(w-text_w)/2:y=${style.y}`;
    baseFilters.push(drawtext);
  }

  baseFilters.push(`fade=t=in:st=0:d=0.35`);
  baseFilters.push(`fade=t=out:st=${Math.max(duration - 0.35, 0.1)}:d=0.35`);
  baseFilters.push('format=yuv420p');

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', scene.clip,
    '-t', String(duration),
    '-vf', baseFilters.join(','),
    '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    out,
  ], { stdio: 'inherit' });

  sceneFiles.push(out);
  console.log(`escena ${index + 1}/${spec.scenes.length} ok -> ${path.basename(out)}`);
}

const listFile = path.join(workDir, 'concat.txt');
fs.writeFileSync(listFile, sceneFiles.map((file) => `file '${file.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

fs.mkdirSync(path.dirname(spec.output), { recursive: true });
execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0',
  '-i', listFile,
  '-c', 'copy',
  '-movflags', '+faststart',
  spec.output,
], { stdio: 'inherit' });

console.log(`REEL OK -> ${spec.output}`);
