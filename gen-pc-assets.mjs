import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import path from 'path';

const browser = await chromium.launch();
const page = await browser.newPage();

// --- LOGO 600x400 transparent ---
await page.setViewportSize({ width: 600, height: 400 });
await page.setContent(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 600px; height: 400px;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
  }
  .wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 600;
    font-size: 96px;
    color: #F5EDD8;
    letter-spacing: -0.02em;
    line-height: 1;
    text-shadow: 0 2px 24px rgba(0,0,0,0.4);
  }
</style>
</head>
<body>
  <span class="wordmark">Dicobluff</span>
</body>
</html>`);

await page.waitForTimeout(1500);
await page.screenshot({
  path: 'store-screenshots/pc-logo.png',
  omitBackground: true,
  clip: { x: 0, y: 0, width: 600, height: 400 }
});
console.log('Logo 600x400 generated');

// --- FEATURE IMAGE 1920x1080 no text ---
const logoPath = path.resolve('assets/icons/logo-mark-transparent.png');
const logoB64 = readFileSync(logoPath).toString('base64');

await page.setViewportSize({ width: 1920, height: 1080 });
await page.setContent(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; }
  body {
    width: 1920px; height: 1080px;
    background: #0B1628;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .bg-glow {
    position: absolute;
    width: 900px; height: 900px;
    background: radial-gradient(circle, rgba(200,134,10,0.18) 0%, transparent 65%);
    border-radius: 50%;
  }
  .logo {
    width: 600px; height: 600px;
    object-fit: contain;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 0 60px rgba(200,134,10,0.35));
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <img class="logo" src="data:image/png;base64,${logoB64}">
</body>
</html>`);

await page.waitForTimeout(500);
await page.screenshot({
  path: 'store-screenshots/pc-feature.png',
  clip: { x: 0, y: 0, width: 1920, height: 1080 }
});
console.log('Feature image 1920x1080 generated');

await browser.close();
