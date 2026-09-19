/**
 * Renderizador de escenas Veyra — reel tipográfico suizo con fotos editoriales.
 * Lee GUAKI_CREATIVES/_pipeline/reel-pro-veyra/scenes.json → PNG 1080x1920.
 *
 * Identidad Veyra (brands/veyra/DESIGN.md): fotos + scrim oscuro, titular Outfit 900
 * UPPERCASE blanco, kicker JetBrains Mono naranja, caja URL rectangular blanca, cero emojis.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve("C:/Users/edwin/Documents/Trinidad");
const WORK = path.join(ROOT, "GUAKI_CREATIVES/_pipeline/reel-pro-veyra");
const OUT_DIR = path.join(WORK, "scenes");
fs.mkdirSync(OUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(path.join(WORK, "scenes.json"), "utf8"));

const T = {
  black: "#0A0A0A",
  white: "#FFFFFF",
  ink: "#0A0A0A",
  orange: "#FF5722",
  gray: "#F8FAFC",
};

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sceneHtml(scene, index, total) {
  const urlBox = scene.url
    ? `<div class="url-box">${esc(scene.url)}</div>`
    : "";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;900&family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; }
  body { position: relative; background: ${T.black}; font-family: 'Inter', system-ui, sans-serif; color: ${T.white}; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,10,10,0.66) 0%, rgba(10,10,10,0.30) 38%, rgba(10,10,10,0.88) 100%); }
  .top-line { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${T.orange}; }
  .content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 90px 200px; }
  .logo { position: absolute; top: 96px; left: 76px; font-family: 'Outfit'; font-weight: 900; font-size: 34px; letter-spacing: 0.04em; color: ${T.white}; text-transform: uppercase; }
  .kicker { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 30px; letter-spacing: 0.16em; text-transform: uppercase; color: ${T.orange}; margin-bottom: 30px; }
  .title { font-family: 'Outfit'; font-weight: 900; font-size: 104px; line-height: 1.02; letter-spacing: -0.01em; text-transform: uppercase; color: ${T.white}; max-width: 900px; margin-bottom: 30px; }
  .title .tl { display: block; }
  .sub { font-family: 'Inter'; font-weight: 600; font-size: 42px; line-height: 1.35; color: rgba(255,255,255,0.82); max-width: 860px; }
  .url-box { margin-top: 48px; align-self: flex-start; background: ${T.white}; color: ${T.ink}; font-family: 'Outfit'; font-weight: 900; font-size: 46px; padding: 26px 44px; border-radius: 0; border: 0; box-shadow: 6px 6px 0 rgba(255,87,34,1); }
  /* Reel: SIN footer de carrusel (Desliza/numeración) — decisión owner vía observer 2026-09-14 */
</style>
</head>
<body>
  <img class="bg" src="../../../03_FONDOS_IA/${esc(scene.bg)}" alt="" />
  <div class="scrim"></div>
  <div class="top-line"></div>
  <div class="logo">VEYRA</div>
  <div class="content">
    <div class="kicker">${esc(scene.kicker)}</div>
    <h1 class="title">${scene.titleLines.map((l) => `<span class="tl">${esc(l)}</span>`).join("")}</h1>
    ${scene.sub ? `<p class="sub">${esc(scene.sub)}</p>` : ""}
    ${urlBox}
  </div>
</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const total = data.scenes.length;
  for (let i = 0; i < total; i++) {
    const scene = data.scenes[i];
    const html = sceneHtml(scene, i, total);
    const htmlPath = path.join(OUT_DIR, `s${String(i + 1).padStart(2, "0")}.html`);
    const pngPath = path.join(OUT_DIR, `s${String(i + 1).padStart(2, "0")}.png`);
    fs.writeFileSync(htmlPath, html, "utf8");
    await page.goto("file:///" + htmlPath.replace(/\\/g, "/"), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: pngPath, type: "png" });
    console.log("OK ", pngPath);
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });