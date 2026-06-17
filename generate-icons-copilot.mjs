import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'fs';

mkdirSync('./assets/icons', { recursive: true });

const pngData    = readFileSync('./Copilot_20260602_224158.png');
const pngBase64  = pngData.toString('base64');
const pngDataUrl = `data:image/png;base64,${pngBase64}`;

// ─── Constantes couleur ──────────────────────────────────────────────────────
const NAVY = '#152252';  // fond du logo Copilot

// ─── Tailles ────────────────────────────────────────────────────────────────
const WEB_SIZES   = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024];
const MASKABLE    = [192, 512];

// Android mipmap : ic_launcher (carré) et ic_launcher_round
const ANDROID = [
  { folder: 'mipmap-mdpi-v4',    size: 48  },
  { folder: 'mipmap-hdpi-v4',    size: 72  },
  { folder: 'mipmap-xhdpi-v4',   size: 96  },
  { folder: 'mipmap-xxhdpi-v4',  size: 144 },
  { folder: 'mipmap-xxxhdpi-v4', size: 192 },
];
// foreground layer pour adaptive icon (108 dp × scale — plus grande zone safe)
const ANDROID_FG = [
  { folder: 'mipmap-mdpi-v4',    size: 108 },
  { folder: 'mipmap-hdpi-v4',    size: 162 },
  { folder: 'mipmap-xhdpi-v4',   size: 216 },
  { folder: 'mipmap-xxhdpi-v4',  size: 324 },
  { folder: 'mipmap-xxxhdpi-v4', size: 432 },
];

const browser = await chromium.launch({ headless: true });

// ── Standard : PNG tel quel ──────────────────────────────────────────────────
async function renderStd(size, path) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;background:transparent;overflow:hidden}
    img{width:${size}px;height:${size}px;display:block}
  </style></head><body><img src="${pngDataUrl}"></body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path, omitBackground: false, clip:{x:0,y:0,width:size,height:size} });
  await page.close();
  console.log('✓', path);
}

// ── Maskable : logo 90% sur fond marine plein (safe zone respectée) ──────────
async function renderMaskable(size, path) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;background:${NAVY};overflow:hidden;
              display:flex;align-items:center;justify-content:center}
    img{width:90%;height:90%;display:block}
  </style></head><body><img src="${pngDataUrl}"></body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path, omitBackground: false, clip:{x:0,y:0,width:size,height:size} });
  await page.close();
  console.log('✓', path);
}

// ── Android launcher : logo 80% centré sur fond marine ──────────────────────
async function renderAndroid(size, path) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;background:${NAVY};overflow:hidden;
              display:flex;align-items:center;justify-content:center}
    img{width:82%;height:82%;display:block}
  </style></head><body><img src="${pngDataUrl}"></body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path, omitBackground: false, clip:{x:0,y:0,width:size,height:size} });
  await page.close();
  console.log('✓', path);
}

// ── Android foreground layer (fond transparent, logo centré dans safe zone) ──
async function renderAndroidFg(size, path) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;background:transparent;overflow:hidden;
              display:flex;align-items:center;justify-content:center}
    img{width:72%;height:72%;display:block}
  </style></head><body><img src="${pngDataUrl}"></body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path, omitBackground: true, clip:{x:0,y:0,width:size,height:size} });
  await page.close();
  console.log('✓', path);
}

// ── 1. Icônes PWA ────────────────────────────────────────────────────────────
console.log('\n── Icônes PWA ──');
for (const size of WEB_SIZES) {
  const name = size === 16 ? 'favicon-16' : size === 32 ? 'favicon-32' : `icon-${size}`;
  await renderStd(size, `./assets/icons/${name}.png`);
}
for (const size of MASKABLE) {
  await renderMaskable(size, `./assets/icons/icon-maskable-${size}.png`);
}

// ── 2. Icônes Android (les deux chemins : src/ et build/) ───────────────────
const ANDROID_ROOTS = [
  'android/app/src/main/res',
  'android/app/build/intermediates/packaged_res/release/packageReleaseResources',
];

console.log('\n── Icônes Android launcher ──');
for (const root of ANDROID_ROOTS) {
  for (const { folder, size } of ANDROID) {
    const dir = `./${root}/${folder}`;
    mkdirSync(dir, { recursive: true });
    await renderAndroid(size, `${dir}/ic_launcher.png`);
    await renderAndroid(size, `${dir}/ic_launcher_round.png`);
  }
  for (const { folder, size } of ANDROID_FG) {
    const dir = `./${root}/${folder}`;
    mkdirSync(dir, { recursive: true });
    await renderAndroidFg(size, `${dir}/ic_launcher_foreground.png`);
  }
}

await browser.close();
console.log('\n✅ Done — assets/icons/ + android mipmaps mis à jour');
