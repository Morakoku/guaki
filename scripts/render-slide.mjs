// Renderiza el slide-01.html corregido a JPG 1080x1350 usando Playwright.
// Salida: <outputPath>
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const [, , inputHtml, outputPath] = process.argv;
if (!inputHtml || !outputPath) {
  console.error('Uso: node scripts/render-slide.mjs <input.html> <output.jpg>');
  process.exit(1);
}
const absHtml = path.resolve(inputHtml);
const absOut = path.resolve(outputPath);
fs.mkdirSync(path.dirname(absOut), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1080, height: 1350 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const url = 'file:///' + absHtml.replace(/\\/g, '/');
await page.goto(url, { waitUntil: 'networkidle' });
// esperar fonts
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
await page.screenshot({ path: absOut, type: 'jpeg', quality: 95, fullPage: false });
await browser.close();
console.log('Render OK:', absOut);
