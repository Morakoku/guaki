/**
 * Captura screenshots de las 3 webs reales de las marcas Trinidad.
 * Uso: node brand-web-capture.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const OUT = path.resolve("C:/Users/edwin/Documents/Trinidad/CONTENT_OS/BRAND_AUDIT");
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  { brand: "guaki", url: "https://guakiweb.vercel.app" },
  { brand: "veyra", url: "https://veyrasoluciones.com" },
  { brand: "brenda", url: "https://brenda-site-psi.vercel.app" },
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const site of SITES) {
  try {
    await page.goto(site.url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1500);
    // Hero / above the fold
    await page.screenshot({ path: path.join(OUT, `${site.brand}-web-hero.png`) });
    // Full page (para tipografía, secciones, colores repetidos)
    await page.screenshot({ path: path.join(OUT, `${site.brand}-web-full.png`), fullPage: true });
    // Extraer CSS computado de elementos clave
    const info = await page.evaluate(() => {
      const pick = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, color: cs.color, font: cs.fontFamily.slice(0, 80), weight: cs.fontWeight, size: cs.fontSize, radius: cs.borderRadius, shadow: cs.boxShadow.slice(0, 120) };
      };
      return {
        title: document.title,
        body: pick(document.body),
        h1: pick(document.querySelector("h1")),
        h2: pick(document.querySelector("h2")),
        button: pick(document.querySelector("button, a[class*='btn'], a[class*='button'], .cta")),
        header: pick(document.querySelector("header, nav")),
        section: pick(document.querySelector("section, main")),
        sampleColors: (() => {
          const set = new Set();
          document.querySelectorAll("*").forEach((el) => {
            const cs = getComputedStyle(el);
            if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") set.add(cs.backgroundColor);
          });
          return [...set].slice(0, 20);
        })(),
        fonts: (() => {
          const set = new Set();
          document.querySelectorAll("h1,h2,h3,p,a,button").forEach((el) => {
            const f = getComputedStyle(el).fontFamily;
            if (f) set.add(f.split(",")[0].replace(/['"]/g, "").trim());
          });
          return [...set].slice(0, 10);
        })(),
      };
    });
    fs.writeFileSync(path.join(OUT, `${site.brand}-web-tokens.json`), JSON.stringify(info, null, 2), "utf8");
    console.log(`OK  ${site.brand}  (${site.url})`);
  } catch (e) {
    console.error(`FAIL ${site.brand}: ${e.message.split("\n")[0]}`);
  }
}
await browser.close();