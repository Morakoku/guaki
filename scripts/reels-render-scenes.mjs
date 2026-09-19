/**
 * Renderiza las escenas de los reels de Guaki a PNG 1080x1920.
 * Lee scenes.json (por reel y por escena), genera el HTML con el
 * sistema visual de Guaki (VIDEO_VISUAL_SYSTEM.md) y captura via Playwright.
 *
 * Uso: node reels-render-scenes.mjs [outDir]
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve("C:/Users/edwin/Documents/Trinidad");
const WORK = path.join(ROOT, "GUAKI_CREATIVES/_pipeline/reel-pro");
const OUT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(WORK, "scenes");
fs.mkdirSync(OUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(path.join(WORK, "scenes.json"), "utf8"));

// ---- Tema real web Guaki (2026-09-14) — guakiweb.vercel.app (claro sage/ink) ----
const T = {
  emerald: "#17382D",   // CTA / botones de la web
  sage: "#E2E8E1",      // fondo real de la web
  cream: "#FFFFFF",     // cards blancas
  green: "#25D366",     // acento WhatsApp (CTA de contacto)
  ink: "#16231D",       // texto real
  kicker: "#17382D",    // kicker sobre claro
  alert: "#E63946",
};

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function bulletsHtml(items = []) {
  return items
    .map(
      (b, i) => `
      <div class="bullet">
        <span class="bullet-num">${i + 1}</span>
        <span class="bullet-text">${esc(b)}</span>
      </div>`,
    )
    .join("");
}

function sceneHtml(scene, reelName) {
  const isHook = scene.type === "hook";
  const isCta = scene.type === "cta";

  let center = "";
  if (isHook) {
    center = `
      <div class="kicker">${esc(scene.kicker)}</div>
      <h1 class="hook-title">${scene.titleLines.map((l) => `<span class="tl">${esc(l)}</span>`).join("")}</h1>
      ${scene.caption ? `<div class="captions-plate"><span class="cp">${esc(scene.caption)}</span></div>` : ""}`;
  } else if (isCta) {
    center = `
      <div class="kicker">${esc(scene.kicker)}</div>
      <h1 class="cta-title">${scene.titleLines.map((l) => `<span class="tl">${esc(l)}</span>`).join("")}</h1>
      <div class="url-pill">👉 ${esc(scene.cta)}</div>
      ${scene.caption ? `<div class="captions-plate"><span class="cp">${esc(scene.caption)}</span></div>` : ""}`;
  } else {
    center = `
      <div class="panel">
        <div class="panel-kicker">${esc(scene.kicker)}</div>
        <h2 class="panel-title">${scene.titleLines.map((l) => `<span class="tl">${esc(l)}</span>`).join("")}</h2>
        ${scene.sub ? `<p class="panel-sub">${esc(scene.sub)}</p>` : ""}
        ${scene.bullets ? `<div class="bullets">${bulletsHtml(scene.bullets)}</div>` : ""}
      </div>
      ${scene.caption ? `<div class="captions-plate"><span class="cp">${esc(scene.caption)}</span></div>` : ""}`;
  }

  // motivo visual (emoji grande) en zona alta — rompe el template idéntico
  const motifPos = isHook || isCta ? "motif-pos" : "motif-b";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;900&family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; }
  body { position: relative; background: ${T.sage}; font-family: 'Inter', system-ui, sans-serif; color: ${T.ink}; }
  .bg { position: absolute; inset: 0; }
  .bg-radial { background: radial-gradient(140% 90% at 70% 12%, rgba(255,255,255,0.55) 0%, transparent 55%), linear-gradient(180deg, #E9EEE7 0%, ${T.sage} 60%, #D8E1D6 100%); }
  .scrim-bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 420px; background: linear-gradient(0deg, rgba(22,35,29,0.10) 0%, rgba(22,35,29,0.03) 55%, transparent 100%); }
  .logo { position: absolute; top: 76px; left: 76px; font-family: 'Outfit'; font-weight: 900; font-size: 34px; letter-spacing: 0.02em; color: ${T.ink}; z-index: 4; }
  .content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 90px; z-index: 3; }
  .kicker { font-family: 'Outfit'; font-weight: 800; font-size: 30px; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.kicker}; margin-bottom: 36px; }
  .hook-title, .cta-title { font-family: 'Outfit'; font-weight: 900; font-size: 108px; line-height: 1.04; letter-spacing: -0.02em; color: ${T.ink}; max-width: 900px; }
  .hook-title .tl, .cta-title .tl { display: block; }
  .cta-title { font-size: 96px; }
  .panel { background: ${T.cream}; border-radius: 44px; padding: 64px 60px; box-shadow: 0 28px 74px rgba(22,35,29,0.18); }
  .panel-kicker { font-family: 'Outfit'; font-weight: 800; font-size: 28px; letter-spacing: 0.18em; text-transform: uppercase; color: ${T.green}; margin-bottom: 28px; }
  .panel-title { font-family: 'Outfit'; font-weight: 900; font-size: 92px; line-height: 1.06; letter-spacing: -0.02em; color: ${T.ink}; max-width: 900px; }
  .panel-title .tl { display: block; }
  .panel-sub { margin-top: 28px; font-family: 'Inter'; font-weight: 600; font-size: 40px; line-height: 1.35; color: #16231DDB; max-width: 900px; }
  .bullets { margin-top: 40px; display: flex; flex-direction: column; gap: 26px; }
  .bullet { display: flex; align-items: center; gap: 24px; }
  .bullet-num { display: inline-flex; width: 64px; height: 64px; border-radius: 50%; background: ${T.emerald}; color: #fff; align-items: center; justify-content: center; font-family: 'Outfit'; font-weight: 900; font-size: 34px; flex-shrink: 0; }
  .bullet-text { font-family: 'Inter'; font-weight: 800; font-size: 46px; color: ${T.ink}; }
  .url-pill { margin-top: 44px; align-self: flex-start; background: ${T.emerald}; color: #FFFFFF; font-family: 'Outfit'; font-weight: 900; font-size: 56px; padding: 28px 56px; border-radius: 999px; box-shadow: 0 10px 24px rgba(23,56,45,0.24); }
  .motif { position: absolute; font-size: 480px; line-height: 1; opacity: 0.20; z-index: 0; user-select: none; filter: saturate(1.15); }
  .motif-pos { top: 220px; right: -40px; }
  .motif-b { top: 60px; left: -20px; }
  .captions-plate { position: absolute; left: 90px; width: 900px; bottom: 400px; z-index: 4; }
  .cp { display: inline-block; font-family: 'Outfit'; font-weight: 700; font-size: 42px; line-height: 1.25; color: ${T.ink}; background: rgba(255,255,255,0.72); padding: 18px 30px; border-radius: 20px; }
</style>
</head>
<body>
  <div class="bg bg-radial"></div>
  <div class="scrim-bottom"></div>
  <div class="motif ${motifPos}">${esc(scene.motif || "📍")}</div>
  <div class="logo">🥑 GUAKI</div>
  <div class="content">${center}</div>
</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const reel of data.reels) {
    for (let i = 0; i < reel.scenes.length; i++) {
      const scene = reel.scenes[i];
      const html = sceneHtml(scene, reel.name);
      const htmlPath = path.join(OUT_DIR, `${reel.id}-s${String(i + 1).padStart(2, "0")}.html`);
      const pngPath = path.join(OUT_DIR, `${reel.id}-s${String(i + 1).padStart(2, "0")}.png`);
      fs.writeFileSync(htmlPath, html, "utf8");

      await page.goto("file:///" + htmlPath.replace(/\\/g, "/"), { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await page.screenshot({ path: pngPath, type: "png" });
      console.log("OK ", pngPath);
    }
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});