import fs from 'node:fs';
import path from 'node:path';

const [, , batchPath, outputDir] = process.argv;
if (!batchPath || !outputDir) {
  console.error('Uso: node scripts/render-ig-posts.mjs <batch.json> <outputDir>');
  console.error('El batch debe llevar "theme": "guaki" | "veyra" | "brenda" (ver 04_COPY_Y_REFERENCIAS/BIBLIAS/).');
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
fs.mkdirSync(outputDir, { recursive: true });

const BG_PREFIX = process.env.IG_BG_PREFIX || '../../../03_FONDOS_IA/';

// Temas reales web (2026-09-14). Tokens extraídos de las webs de cada marca.
// Donde la web no define un color, se marca como // PROPUESTA.
// Nota: las bibles/templates anteriores quedan OVERRIDEadas por estos tokens.
const THEMES = {
  // Tema real web (2026-09-14) — tokens extraídos de guakiweb.vercel.app
  guaki: {
    logo: '🥑 GUAKI',
    url: 'guaki.online',
    coverMode: 'light', // La web real es clara: fondo sage, texto ink
    fonts: { head: 'Outfit', body: 'Inter', kicker: 'Outfit' },
    fontImport: 'family=Outfit:wght@600;700;900&family=Inter:wght@400;600;800',
    colors: {
      emerald: '#17382D',
      emeraldMid: '#1E4638', // PROPUESTA: tono intermedio entre emerald e ink
      green: '#25D366',      // WhatsApp green: acento CTA real
      sage: '#DCE9D5',
      cream: '#E2E8E1',      // Fondo real web: sage claro
      ink: '#16231D',        // Texto real web: ink verde-oscuro
      kickerLight: '#25D366', // WhatsApp green sobre oscuro
      scrimDarkTop: 'rgba(22,35,29,0.72)',
      scrimDarkMid: 'rgba(22,35,29,0.35)',
      scrimDarkBottom: 'rgba(22,35,29,0.82)',
      scrimBrandTop: 'rgba(23,56,45,0.88)',
      scrimBrandMid: 'rgba(23,56,45,0.62)',
      scrimBrandBottom: 'rgba(23,56,45,0.92)',
      scrimLightTop: 'rgba(226,232,225,0.3)',
      scrimLightBottom: 'rgba(226,232,225,0.46)',
      panelShadow: 'rgba(22,35,29,0.18)',
    },
  },
  // Tema real web (2026-09-14) — tokens extraídos de veyrasoluciones.com
  veyra: {
    logo: '🧭 VEYRA',
    url: 'veyrasoluciones.com',
    coverMode: 'dark', // Covers oscuros válidos; web alterna blanco/negro
    titleCase: 'upper', // web: headlines UPPERCASE masivos
    noPhoto: false, // DECISIÓN OWNER 2026-09-14: volver a fotos de fondo (el negro plano se veía soso)
    panelStyle: 'swiss', // card blanca + borde negro 2px + sombra dura 4px + radius 0
    pillRadius: '0', // web: botones rectangulares duros, sin pills
    ctaArrow: '', // biblia §7: sin emojis en arte
    fonts: { head: 'Outfit', body: 'Inter', kicker: 'JetBrains Mono' },
    fontImport: 'family=Outfit:wght@600;700;900&family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@700;800',
    colors: {
      emerald: '#0A0A0A',
      emeraldMid: '#1F1F1F',
      green: '#FF5722',      // Acento naranja principal (WhatsApp #25D366 solo para CTAs de WA)
      sage: '#F8FAFC',       // Gris estructura real
      cream: '#FFFFFF',      // Blanco real
      ink: '#0A0A0A',
      kickerLight: '#FF5722',
      scrimDarkTop: 'rgba(10,10,10,0.78)',
      scrimDarkMid: 'rgba(10,10,10,0.42)',
      scrimDarkBottom: 'rgba(10,10,10,0.86)',
      scrimBrandTop: 'rgba(10,10,10,0.9)',
      scrimBrandMid: 'rgba(10,10,10,0.66)',
      scrimBrandBottom: 'rgba(10,10,10,0.94)',
      scrimLightTop: 'rgba(255,255,255,0.3)',
      scrimLightBottom: 'rgba(255,255,255,0.46)',
      panelShadow: 'rgba(10,10,10,0.18)',
    },
  },
  // Tema real web (2026-09-14) — tokens extraídos de brenda-site-psi.vercel.app
  // Fuente real: SF Pro Display / system-ui. En render usamos Inter como sustituto
  // porque SF Pro no está disponible en Google Fonts.
  brenda: {
    logo: '💅 BRENDA',
    url: 'link en la bio',
    coverMode: 'dark', // Hero oscuro con títulos blancos; paneles gris Apple
    fonts: { head: 'Inter', body: 'Inter', kicker: 'Inter' },
    fontImport: 'family=Inter:wght@400;600;700;800;900',
    colors: {
      emerald: '#1D1D1F',    // Texto/fondo oscuro real
      emeraldMid: '#2C2C2E', // PROPUESTA: gris oscuro Apple
      green: '#9E2B4E',      // Acento berry real
      sage: '#FBF3F6',       // Blush real
      cream: '#F5F5F7',      // Fondo gris Apple real
      ink: '#1D1D1F',        // Texto real
      kickerLight: '#9E2B4E', // Berry sobre oscuro
      scrimDarkTop: 'rgba(29,29,31,0.74)',
      scrimDarkMid: 'rgba(29,29,31,0.36)',
      scrimDarkBottom: 'rgba(29,29,31,0.84)',
      scrimBrandTop: 'rgba(158,43,78,0.9)',
      scrimBrandMid: 'rgba(158,43,78,0.66)',
      scrimBrandBottom: 'rgba(29,29,31,0.92)',
      scrimLightTop: 'rgba(245,245,247,0.3)',
      scrimLightBottom: 'rgba(245,245,247,0.46)',
      panelShadow: 'rgba(29,29,31,0.16)',
    },
  },
};

let themeName = batch.theme;
if (!themeName) {
  console.warn('AVISO: batch sin "theme" → usando "guaki" (retrocompatible; los batches nuevos DEBEN declarar theme).');
  themeName = 'guaki';
}
const theme = THEMES[themeName];
if (!theme) {
  console.error(`Tema desconocido: "${themeName}". Validos: ${Object.keys(THEMES).join(', ')}`);
  process.exit(1);
}
const COLORS = theme.colors;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function bulletsHtml(bullets = []) {
  return bullets
    .map(
      (item) =>
        `<li><span class="check">✓</span><span>${escapeHtml(item)}</span></li>`,
    )
    .join('');
}

function slideHtml(slide, index, total) {
  const bg = slide.bg;
  const isCover = slide.layout === 'cover-dark';
  const isCta = slide.layout === 'cta-emerald';
  const isStory = slide.layout === 'story';
  const number = slide.number || `${index + 1}/${total}`;
  const isLight = theme.coverMode === 'light';
  const isLightCover = isCover && isLight;
  const isPanel = !isStory && !isCover && !isCta;

  const optionsHtml = (slide.options || [])
    .map(
      (option, optionIndex) =>
        `<div class="option"><span class="opt-letter">${String.fromCharCode(65 + optionIndex)}</span><span>${escapeHtml(option)}</span></div>`,
    )
    .join('');

  const inner = isStory
    ? `
      <div class="scrim ${slide.scrim === 'light' ? 'scrim-light' : 'scrim-dark'}"></div>
      <div class="content content-cover">
        <div class="topbar">
          <span class="logo">${escapeHtml(theme.logo)}</span>
          <span class="counter counter-light">${escapeHtml(slide.topRight || 'HISTORIA')}</span>
        </div>
        ${slide.kicker ? `<span class="kicker kicker-light">${escapeHtml(slide.kicker)}</span>` : ''}
        <h1 class="title title-cover story-title">${escapeHtml(slide.title)}</h1>
        ${slide.body ? `<p class="sub sub-light">${escapeHtml(slide.body)}</p>` : ''}
        ${optionsHtml ? `<div class="options">${optionsHtml}</div>` : ''}
        ${slide.url ? `<div class="url-pill">${theme.ctaArrow ?? '👉 '}${escapeHtml(slide.url)}</div>` : ''}
        <div class="footer-row">
          <span class="hint">${escapeHtml(slide.hint || '')}</span>
          <span class="counter">${escapeHtml(theme.url)}</span>
        </div>
      </div>`
    : isCover
    ? `
      <div class="scrim ${isLightCover ? 'scrim-light-cover' : 'scrim-dark'}"></div>
      <div class="content content-cover">
        <div class="topbar">
          <span class="logo">${escapeHtml(theme.logo)}</span>
          ${slide.badge ? `<span class="badge">${escapeHtml(slide.badge)}</span>` : ''}
        </div>
        ${slide.kicker ? `<span class="kicker ${isLightCover ? 'kicker-light-cover' : 'kicker-light'}">${escapeHtml(slide.kicker)}</span>` : ''}
        <h1 class="title title-cover">${escapeHtml(slide.title)}</h1>
        ${slide.sub ? `<p class="sub ${isLightCover ? 'sub-light-cover' : 'sub-light'}">${escapeHtml(slide.sub)}</p>` : ''}
        <div class="footer-row">
          <span class="hint">${escapeHtml(slide.hint || 'Desliza →')}</span>
          <span class="counter">${escapeHtml(number)}</span>
        </div>
      </div>`
    : isCta
      ? `
      <div class="scrim scrim-emerald"></div>
      <div class="content content-cover">
        <div class="topbar">
          <span class="logo">${escapeHtml(theme.logo)}</span>
          <span class="counter counter-light">${escapeHtml(number)}</span>
        </div>
        ${slide.kicker ? `<span class="kicker kicker-light">${escapeHtml(slide.kicker)}</span>` : ''}
        <h1 class="title title-cover">${escapeHtml(slide.title)}</h1>
        ${slide.body ? `<p class="sub sub-light">${escapeHtml(slide.body)}</p>` : ''}
        <div class="url-pill">${theme.ctaArrow ?? '👉 '}${escapeHtml(slide.url || theme.url)}</div>
      </div>`
      : `
      <div class="scrim scrim-light"></div>
      <div class="content">
        <div class="panel">
          <div class="panel-top">
            ${slide.kicker ? `<span class="kicker kicker-dark">${escapeHtml(slide.kicker)}</span>` : ''}
            <span class="counter counter-dark">${escapeHtml(number)}</span>
          </div>
          <h2 class="title title-slide">${escapeHtml(slide.title)}</h2>
          ${slide.body ? `<p class="body">${escapeHtml(slide.body)}</p>` : ''}
          ${slide.bullets ? `<ul class="bullets">${bulletsHtml(slide.bullets)}</ul>` : ''}
        </div>
      </div>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(slide.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?${theme.fontImport}&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100vw; height: 100vh; overflow: hidden; }
  body { position: relative; background: ${COLORS.emerald}; font-family: '${theme.fonts.body}', system-ui, sans-serif; }
  body.theme-light { background: ${COLORS.cream}; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .bg.bg-decorative { opacity: 0.12; object-fit: cover; }
  .scrim { position: absolute; inset: 0; }
  .scrim-dark { background: linear-gradient(180deg, ${COLORS.scrimDarkTop} 0%, ${COLORS.scrimDarkMid} 38%, ${COLORS.scrimDarkBottom} 100%); }
  .scrim-emerald { background: linear-gradient(180deg, ${COLORS.scrimBrandTop} 0%, ${COLORS.scrimBrandMid} 45%, ${COLORS.scrimBrandBottom} 100%); }
  .scrim-light { background: linear-gradient(180deg, ${COLORS.scrimLightTop} 0%, ${COLORS.scrimLightBottom} 100%); }
  .content { position: absolute; inset: 0; padding: 7.78vw 7.04vw; display: flex; flex-direction: column; }
  .content-cover { justify-content: flex-end; gap: 2.4vw; }
  .topbar { position: absolute; top: 7.04vw; left: 7.04vw; right: 7.04vw; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-family: '${theme.fonts.head}'; font-weight: 900; font-size: 3.15vw; letter-spacing: 0.02em; color: ${COLORS.cream}; }
  .badge { font-family: '${theme.fonts.head}'; font-weight: 900; font-size: 2.22vw; letter-spacing: 0.14em; color: ${COLORS.emerald}; background: ${COLORS.sage}; padding: 0.93vw 2.04vw; border-radius: ${theme.pillRadius || '999px'}; }
  .kicker { font-family: '${theme.fonts.kicker}'; font-weight: 700; font-size: 2.41vw; letter-spacing: 0.16em; text-transform: uppercase; }
  .kicker-light { color: ${COLORS.kickerLight}; }
  .kicker-dark { color: ${COLORS.green}; }
  .title { font-family: '${theme.fonts.head}'; font-weight: 900; letter-spacing: -0.02em; }
  .title-cover { color: ${COLORS.cream}; font-size: 8.52vw; line-height: 1.02; max-width: 83vw; }
  .title-slide { color: ${COLORS.ink}; font-size: 6.67vw; line-height: 1.06; }
  .sub { font-weight: 600; }
  .sub-light { color: ${COLORS.cream}E8; font-size: 3.52vw; line-height: 1.4; max-width: 72vw; }
  .footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 1.3vw; }
  .hint { color: ${COLORS.cream}D8; font-weight: 800; font-size: 2.96vw; }
  .counter { font-family: '${theme.fonts.head}'; font-weight: 700; font-size: 2.59vw; color: ${COLORS.cream}CC; }
  .counter-light { color: ${COLORS.cream}D8; }
  .counter-dark { color: ${COLORS.ink}8C; }
  .url-pill { margin-top: 1.7vw; align-self: flex-start; background: ${COLORS.sage}; color: ${COLORS.emerald}; font-family: '${theme.fonts.head}'; font-weight: 900; font-size: 3.7vw; padding: 2.04vw 3.7vw; border-radius: ${theme.pillRadius || '999px'}; }
  .panel { background: ${COLORS.cream}F0; border-radius: 4.44vw; padding: 5.93vw 5.37vw; box-shadow: 0 2.78vw 7.41vw ${COLORS.panelShadow}; margin-top: auto; }
  .panel-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3.15vw; }
  .body { color: ${COLORS.ink}DB; font-size: 3.7vw; line-height: 1.42; font-weight: 600; margin-top: 2.4vw; }
  .bullets { list-style: none; margin-top: 3.15vw; display: flex; flex-direction: column; gap: 1.85vw; }
  .bullets li { display: flex; align-items: center; gap: 1.67vw; color: ${COLORS.ink}; font-size: 3.7vw; font-weight: 800; }
  .check { display: inline-flex; width: 4.26vw; height: 4.26vw; border-radius: 50%; background: ${COLORS.green}; color: #fff; align-items: center; justify-content: center; font-size: 2.41vw; flex-shrink: 0; }
  .story-title { font-size: 6.8vw; max-width: 88vw; }
  .options { display: flex; flex-direction: column; gap: 1.7vw; margin-top: 1.5vw; }
  .option { display: flex; align-items: center; gap: 1.5vw; background: ${COLORS.cream}24; border: 1px solid ${COLORS.cream}60; border-radius: 999px; padding: 1.7vw 2.4vw; color: ${COLORS.cream}; font-size: 3.1vw; font-weight: 700; }
  .opt-letter { display: inline-flex; width: 4.3vw; height: 4.3vw; border-radius: 50%; background: ${COLORS.sage}; color: ${COLORS.emerald}; align-items: center; justify-content: center; font-family: '${theme.fonts.head}'; font-weight: 900; font-size: 2.6vw; flex-shrink: 0; }
  /* Modo cover claro (Guaki): fondo sage, texto ink, foto decorativa sutil */
  .scrim-light-cover { background: linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(226,232,225,0.08) 40%, rgba(226,232,225,0.30) 100%); }
  body.theme-light .logo { color: ${COLORS.ink}; }
  body.theme-light .badge { color: ${COLORS.ink}; background: #FFFFFF; border: 0.3vw solid ${COLORS.ink}; }
  body.theme-light .kicker-light-cover { color: ${COLORS.ink}; }
  body.theme-light .title-cover { color: ${COLORS.ink}; }
  body.theme-light .sub-light-cover { color: ${COLORS.ink}D8; }
  body.theme-light .hint { color: ${COLORS.ink}B8; }
  body.theme-light .counter { color: ${COLORS.ink}A0; }
  body.theme-light .panel { background: #FFFFFFF0; }
  body.theme-light .kicker-dark { color: ${COLORS.ink}; }
  body.theme-light .check { background: ${COLORS.emerald}; }
  /* Modo suizo web Veyra (2026-09-14): UPPERCASE, negro total en cover/CTA, card con borde duro */
  body.title-upper .title { text-transform: uppercase; }
  body.title-upper .title-cover { font-size: 7.6vw; }
  body.panel-page { background: ${COLORS.sage}; }
  /* Card suiza: borde negro duro + sombra desplazada + radio 0 (patrón de cards de veyrasoluciones.com).
     Se aplica por panelStyle, NO por no-photo (la foto puede convivir con la card suiza). */
  body.panel-swiss .panel { background: #FFFFFF; border: 0.3vw solid ${COLORS.ink}; border-radius: 0; box-shadow: 0.6vw 0.6vw 0 ${COLORS.ink}; }
  body.panel-swiss .check { border-radius: 0; }
</style>
</head>
<body class="${isLight && !isCta ? 'theme-light ' : ''}${theme.titleCase === 'upper' ? 'title-upper ' : ''}${theme.noPhoto && isPanel ? 'panel-page ' : ''}${theme.noPhoto ? 'no-photo ' : ''}${theme.panelStyle === 'swiss' && isPanel ? 'panel-swiss' : ''}">
  ${theme.noPhoto ? '' : `<img class="bg ${isLightCover ? 'bg-decorative' : ''}" src="${BG_PREFIX}${escapeHtml(bg)}" alt="" />`}
  ${inner}
</body>
</html>`;
}

let index = 0;
for (const slide of batch.slides) {
  index += 1;
  const fileName = `slide-${String(index).padStart(2, '0')}.html`;
  fs.writeFileSync(path.join(outputDir, fileName), slideHtml(slide, index - 1, batch.slides.length));
  console.log(`wrote ${fileName} -> ${slide.title.slice(0, 48)}`);
}
console.log(`Total: ${index} slides (tema: ${themeName}) en ${outputDir}`);
