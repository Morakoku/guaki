import fs from 'node:fs';
import path from 'node:path';

const [, , batchPath, outputDir] = process.argv;
if (!batchPath || !outputDir) {
  console.error('Uso: node scripts/render-ig-posts.mjs <batch.json> <outputDir>');
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
fs.mkdirSync(outputDir, { recursive: true });

const BG_PREFIX = process.env.IG_BG_PREFIX || '../../../03_FONDOS_IA/';

const COLORS = {
  emerald: '#17382D',
  emeraldMid: '#2A5A4A',
  green: '#15803D',
  sage: '#DCE9D5',
  cream: '#F4F7F2',
  ink: '#10241C',
};

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
          <span class="logo">🥑 GUAKI</span>
          <span class="counter counter-light">${escapeHtml(slide.topRight || 'HISTORIA')}</span>
        </div>
        ${slide.kicker ? `<span class="kicker kicker-light">${escapeHtml(slide.kicker)}</span>` : ''}
        <h1 class="title title-cover story-title">${escapeHtml(slide.title)}</h1>
        ${slide.body ? `<p class="sub sub-light">${escapeHtml(slide.body)}</p>` : ''}
        ${optionsHtml ? `<div class="options">${optionsHtml}</div>` : ''}
        ${slide.url ? `<div class="url-pill">👉 ${escapeHtml(slide.url)}</div>` : ''}
        <div class="footer-row">
          <span class="hint">${escapeHtml(slide.hint || '')}</span>
          <span class="counter">guaki.online</span>
        </div>
      </div>`
    : isCover
    ? `
      <div class="scrim scrim-dark"></div>
      <div class="content content-cover">
        <div class="topbar">
          <span class="logo">🥑 GUAKI</span>
          ${slide.badge ? `<span class="badge">${escapeHtml(slide.badge)}</span>` : ''}
        </div>
        ${slide.kicker ? `<span class="kicker kicker-light">${escapeHtml(slide.kicker)}</span>` : ''}
        <h1 class="title title-cover">${escapeHtml(slide.title)}</h1>
        ${slide.sub ? `<p class="sub sub-light">${escapeHtml(slide.sub)}</p>` : ''}
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
          <span class="logo">🥑 GUAKI</span>
          <span class="counter counter-light">${escapeHtml(number)}</span>
        </div>
        ${slide.kicker ? `<span class="kicker kicker-light">${escapeHtml(slide.kicker)}</span>` : ''}
        <h1 class="title title-cover">${escapeHtml(slide.title)}</h1>
        ${slide.body ? `<p class="sub sub-light">${escapeHtml(slide.body)}</p>` : ''}
        <div class="url-pill">👉 ${escapeHtml(slide.url || 'guaki.online')}</div>
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
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;900&family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100vw; height: 100vh; overflow: hidden; }
  body { position: relative; background: ${COLORS.emerald}; font-family: 'Inter', system-ui, sans-serif; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .scrim { position: absolute; inset: 0; }
  .scrim-dark { background: linear-gradient(180deg, rgba(16,36,28,0.72) 0%, rgba(16,36,28,0.35) 38%, rgba(16,36,28,0.82) 100%); }
  .scrim-emerald { background: linear-gradient(180deg, rgba(23,56,45,0.88) 0%, rgba(23,56,45,0.62) 45%, rgba(21,74,52,0.92) 100%); }
  .scrim-light { background: linear-gradient(180deg, rgba(244,247,242,0.28) 0%, rgba(244,247,242,0.42) 100%); }
  .content { position: absolute; inset: 0; padding: 7.78vw 7.04vw; display: flex; flex-direction: column; }
  .content-cover { justify-content: flex-end; gap: 2.4vw; }
  .topbar { position: absolute; top: 7.04vw; left: 7.04vw; right: 7.04vw; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-family: 'Outfit'; font-weight: 900; font-size: 3.15vw; letter-spacing: 0.02em; color: ${COLORS.cream}; }
  .badge { font-family: 'Outfit'; font-weight: 900; font-size: 2.22vw; letter-spacing: 0.14em; color: ${COLORS.emerald}; background: ${COLORS.sage}; padding: 0.93vw 2.04vw; border-radius: 999px; }
  .kicker { font-family: 'Outfit'; font-weight: 700; font-size: 2.41vw; letter-spacing: 0.16em; text-transform: uppercase; }
  .kicker-light { color: #B9E4C6; }
  .kicker-dark { color: ${COLORS.green}; }
  .title { font-family: 'Outfit'; font-weight: 900; letter-spacing: -0.02em; }
  .title-cover { color: ${COLORS.cream}; font-size: 8.52vw; line-height: 1.02; max-width: 83vw; }
  .title-slide { color: ${COLORS.ink}; font-size: 6.67vw; line-height: 1.06; }
  .sub { font-weight: 600; }
  .sub-light { color: rgba(244,247,242,0.92); font-size: 3.52vw; line-height: 1.4; max-width: 72vw; }
  .footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 1.3vw; }
  .hint { color: rgba(244,247,242,0.85); font-weight: 800; font-size: 2.96vw; }
  .counter { font-family: 'Outfit'; font-weight: 700; font-size: 2.59vw; color: rgba(244,247,242,0.8); }
  .counter-light { color: rgba(244,247,242,0.85); }
  .counter-dark { color: rgba(16,36,28,0.55); }
  .url-pill { margin-top: 1.7vw; align-self: flex-start; background: ${COLORS.sage}; color: ${COLORS.emerald}; font-family: 'Outfit'; font-weight: 900; font-size: 3.7vw; padding: 2.04vw 3.7vw; border-radius: 999px; }
  .panel { background: rgba(244,247,242,0.94); border-radius: 4.44vw; padding: 5.93vw 5.37vw; box-shadow: 0 2.78vw 7.41vw rgba(16,36,28,0.22); margin-top: auto; }
  .panel-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3.15vw; }
  .body { color: rgba(16,36,28,0.86); font-size: 3.7vw; line-height: 1.42; font-weight: 600; margin-top: 2.4vw; }
  .bullets { list-style: none; margin-top: 3.15vw; display: flex; flex-direction: column; gap: 1.85vw; }
  .bullets li { display: flex; align-items: center; gap: 1.67vw; color: ${COLORS.ink}; font-size: 3.7vw; font-weight: 800; }
  .check { display: inline-flex; width: 4.26vw; height: 4.26vw; border-radius: 50%; background: ${COLORS.green}; color: #fff; align-items: center; justify-content: center; font-size: 2.41vw; flex-shrink: 0; }
  .story-title { font-size: 6.8vw; max-width: 88vw; }
  .options { display: flex; flex-direction: column; gap: 1.7vw; margin-top: 1.5vw; }
  .option { display: flex; align-items: center; gap: 1.5vw; background: rgba(244,247,242,0.14); border: 1px solid rgba(244,247,242,0.38); border-radius: 999px; padding: 1.7vw 2.4vw; color: ${COLORS.cream}; font-size: 3.1vw; font-weight: 700; }
  .opt-letter { display: inline-flex; width: 4.3vw; height: 4.3vw; border-radius: 50%; background: ${COLORS.sage}; color: ${COLORS.emerald}; align-items: center; justify-content: center; font-family: 'Outfit'; font-weight: 900; font-size: 2.6vw; flex-shrink: 0; }
</style>
</head>
<body>
  <img class="bg" src="${BG_PREFIX}${escapeHtml(bg)}" alt="" />
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
console.log(`Total: ${index} slides en ${outputDir}`);
