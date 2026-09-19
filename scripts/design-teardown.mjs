/**
 * design-teardown.mjs — extrae el sistema de diseño de CUALQUIER web de referencia.
 *
 * Uso: node guaki/scripts/design-teardown.mjs <url> <nombre-slug> [outDir]
 *
 * Produce en outDir (default CONTENT_OS/teardowns/<nombre-slug>/):
 *  - hero-desktop.png / hero-mobile.png   (capturas de evidencia)
 *  - tokens.json                           (tokens W3C-style: color/tipo/espaciado/bordes/sombras)
 *  - DESIGN.md                             (resumen legible para agente/diseñador)
 *
 * Cero dependencias nuevas: usa Playwright (ya instalado) y lectura de computed styles.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const [, , url, slug, outArg] = process.argv;
if (!url || !slug) {
  console.error("Uso: node design-teardown.mjs <url> <nombre-slug> [outDir]");
  process.exit(1);
}
const OUT = path.resolve(outArg || `C:/Users/edwin/Documents/Trinidad/CONTENT_OS/teardowns/${slug}`);
fs.mkdirSync(OUT, { recursive: true });

const EXTRACT = () => {
  const rgbToHex = (rgb) => {
    const m = String(rgb).match(/\d+/g);
    if (!m) return rgb;
    return "#" + m.slice(0, 3).map((x) => (+x).toString(16).padStart(2, "0")).join("").toUpperCase();
  };
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      color: rgbToHex(cs.color),
      bg: rgbToHex(cs.backgroundColor),
      font: cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
      weight: cs.fontWeight,
      size: cs.fontSize,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      radius: cs.borderRadius,
      shadow: cs.boxShadow === "none" ? null : cs.boxShadow.slice(0, 120),
      border: cs.borderWidth === "0px" ? null : `${cs.borderWidth} ${cs.borderStyle} ${rgbToHex(cs.borderColor)}`,
    };
  };
  const colorCount = {};
  document.querySelectorAll("body *").forEach((el) => {
    const cs = getComputedStyle(el);
    for (const prop of ["color", "backgroundColor"]) {
      const v = cs[prop];
      if (!v || v === "rgba(0, 0, 0, 0)" || v === "transparent") continue;
      const hex = rgbToHex(v);
      if (/^#[0-9A-F]{6}$/.test(hex)) colorCount[hex] = (colorCount[hex] || 0) + 1;
    }
  });
  const topColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([hex, n]) => ({ hex, uses: n }));
  return {
    title: document.title,
    meta: {
      h1: pick(document.querySelector("h1")),
      h2: pick(document.querySelector("h2")),
      body: pick(document.body),
      link: pick(document.querySelector("a")),
      button: pick(document.querySelector("button, a[class*=btn], a[class*=button], .cta")),
      header: pick(document.querySelector("header, nav")),
      card: pick(document.querySelector("[class*=card], [class*=Card], section section")),
    },
    palette: topColors,
    fontsUsed: [...new Set([...document.querySelectorAll("h1,h2,h3,p,a,button")].map((el) => getComputedStyle(el).fontFamily.split(",")[0].replace(/['"]/g, "").trim()))].slice(0, 6),
    radii: [...new Set([...document.querySelectorAll("body *")].slice(0, 800).map((el) => getComputedStyle(el).borderRadius).filter((v) => v && v !== "0px"))].slice(0, 8),
    spacingHint: (() => {
      const gaps = [...document.querySelectorAll("body *")].slice(0, 600).map((el) => getComputedStyle(el).gap).filter((v) => v && v !== "normal");
      return [...new Set(gaps)].slice(0, 6);
    })(),
  };
};

const browser = await chromium.launch({ headless: true });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

// Desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, userAgent: UA, locale: "es-CO" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "hero-desktop.png") });
  fs.writeFileSync(path.join(OUT, "tokens.json"), JSON.stringify(await page.evaluate(EXTRACT), null, 2), "utf8");
  await ctx.close();
}
// Mobile
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", locale: "es-CO" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "hero-mobile.png") });
  await ctx.close();
} catch (e) { console.error("mobile capture failed:", e.message.split("\n")[0]); }

await browser.close();

// DESIGN.md generado
const t = JSON.parse(fs.readFileSync(path.join(OUT, "tokens.json"), "utf8"));
const line = (label, m) => m ? `- **${label}**: ${m.font} ${m.weight} · ${m.size} · lh ${m.lineHeight} · ls ${m.letterSpacing} · ${m.textTransform === "uppercase" ? "UPPERCASE · " : ""}texto ${m.color} · fondo ${m.bg}${m.radius && m.radius !== "0px" ? " · radio " + m.radius : ""}${m.border ? " · borde " + m.border : ""}${m.shadow ? " · sombra " + m.shadow.slice(0, 60) : ""}` : null;
const md = [
  `# DESIGN.md — referencia: ${slug}`,
  `> Generado por design-teardown.mjs el ${new Date().toISOString().slice(0, 10)} · URL: ${url}`,
  `> Título del sitio: ${t.title}`,
  "",
  "## Tipografía observada",
  ...[line("H1", t.meta.h1), line("H2", t.meta.h2), line("Body", t.meta.body), line("Botón/CTA", t.meta.button), line("Card", t.meta.card)].filter(Boolean),
  `- Fuentes en uso: ${t.fontsUsed.join(", ")}`,
  "",
  "## Paleta (top colores por frecuencia de uso)",
  ...t.palette.map((c) => `- \`${c.hex}\` (${c.uses} usos)`),
  "",
  "## Geometría",
  `- Radios no-cero: ${t.radii.join(", ") || "solo esquinas rectas"}`,
  `- Gaps frecuentes: ${t.spacingHint.join(", ") || "—"}`,
  "",
  "## Cómo usar esto",
  "1. Compara cada token con nuestro sistema (CONTENT_OS/brands/<marca>/DESIGN.md).",
  "2. Roba PATRONES (jerarquía, radio, uso del acento), nunca contenido.",
  "3. Registra la lección en PLAYBOOK/05 si cambia una regla de marca.",
].join("\n");
fs.writeFileSync(path.join(OUT, "DESIGN.md"), md, "utf8");
console.log("OK teardown ->", OUT);
