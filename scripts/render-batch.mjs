/**
 * Renderiza en lote todos los HTML de un directorio a JPG.
 * Uso: node render-batch.mjs <htmlDir> <outDir> [width=1080] [height=1350]
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const [, , htmlDir, outDir, w, h] = process.argv;
if (!htmlDir || !outDir) {
  console.error("Uso: node render-batch.mjs <htmlDir> <outDir> [width] [height]");
  process.exit(1);
}
const width = parseInt(w || "1080", 10);
const height = parseInt(h || "1350", 10);
const absHtml = path.resolve(htmlDir);
const absOut = path.resolve(outDir);
fs.mkdirSync(absOut, { recursive: true });

const files = fs.readdirSync(absHtml).filter((f) => f.endsWith(".html")).sort();
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const f of files) {
  const htmlPath = path.join(absHtml, f);
  const outPath = path.join(absOut, f.replace(/\.html$/, ".jpg"));
  await page.goto("file:///" + htmlPath.replace(/\\/g, "/"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: outPath, type: "jpeg", quality: 92 });
  console.log("OK", path.basename(outPath));
}
await browser.close();
console.log(`Total ${files.length} slides -> ${absOut}`);
