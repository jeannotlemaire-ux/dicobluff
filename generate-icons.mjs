import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('./assets/icons', { recursive: true });

// ── SVG template function ────────────────────────────────────────────────────
// maskable=true → fond plein (pas de rx), sans ombre (évite l'artefact de bord)
function makeSVG({ maskable = false } = {}) {
  const rx     = maskable ? '' : 'rx="114"';
  const shadow = maskable ? '' : 'filter="url(#shadow)"';
  const sheen  = maskable ? '' : `<path fill="url(#sheen)"
    d="M 226,72 C 470,72 470,440 226,440 L 240,440 C 484,440 484,72 240,72 Z"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="25%" y1="0%" x2="75%" y2="100%">
      <stop offset="0%" stop-color="#14263A"/>
      <stop offset="100%" stop-color="#070C13"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="30%" cy="24%" r="54%">
      <stop offset="0%" stop-color="#1C3650" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#070C13" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="12%" y1="0%" x2="88%" y2="100%">
      <stop offset="0%"   stop-color="#FFF2BC"/>
      <stop offset="20%"  stop-color="#F2C020"/>
      <stop offset="52%"  stop-color="#CA8408"/>
      <stop offset="86%"  stop-color="#7E4C04"/>
      <stop offset="100%" stop-color="#5C3402"/>
    </linearGradient>
    <!-- Reflet sur la face courbe du D -->
    <radialGradient id="sheen" cx="72%" cy="40%" r="32%">
      <stop offset="0%" stop-color="#FFFBDE" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#FFFBDE" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-15%" y="-10%" width="130%" height="126%">
      <feDropShadow dx="2" dy="12" stdDeviation="18" flood-color="#000208" flood-opacity="0.65"/>
    </filter>
    <!-- Masque : guillemets ouvrants typographiques (") découpés dans le D -->
    <mask id="qMask">
      <rect width="512" height="512" fill="white"/>
      <text
        x="242" y="325"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="170"
        font-weight="bold"
        fill="black"
        letter-spacing="4">&#x201C;</text>
    </mask>
  </defs>

  <!-- Fond -->
  <rect width="512" height="512" ${rx} fill="url(#bg)"/>
  <rect width="512" height="512" ${rx} fill="url(#bgGlow)"/>

  <!-- D doré avec guillemets typographiques découpés -->
  <path
    fill="url(#gold)"
    ${shadow}
    mask="url(#qMask)"
    d="M 118,72 L 226,72 C 470,72 470,440 226,440 L 118,440 Z"/>

  <!-- Reflet métallique sur la courbe (standard seulement) -->
  ${sheen}

  <!-- Filet lumineux sur le montant gauche -->
  <line x1="118" y1="72" x2="118" y2="440"
    stroke="rgba(255,244,160,0.13)" stroke-width="4" stroke-linecap="round"/>
</svg>`;
}

const SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024];
const MASKABLE = [192, 512];

const browser = await chromium.launch({ headless: true });

async function renderSVG(svg, size, path) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html>
<html><head>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${size}px; height:${size}px; background:transparent; overflow:hidden; }
  svg { width:${size}px; height:${size}px; display:block; }
</style>
</head><body>${svg}</body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path, omitBackground: true, clip: { x:0, y:0, width:size, height:size } });
  await page.close();
  console.log('✓', path);
}

const svgStd  = makeSVG({ maskable: false });
const svgMask = makeSVG({ maskable: true });

for (const size of SIZES) {
  const name = size === 16 ? 'favicon-16'
    : size === 32 ? 'favicon-32'
    : `icon-${size}`;
  await renderSVG(svgStd, size, `./assets/icons/${name}.png`);
}

for (const size of MASKABLE) {
  await renderSVG(svgMask, size, `./assets/icons/icon-maskable-${size}.png`);
}

await browser.close();
console.log('\nDone → assets/icons/');
