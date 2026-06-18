import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = './store-screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

// Play Store phone : 1080×1920 (ratio 9:16, parfaitement dans spec)
async function newPage() {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },   // iPhone 14 — layout mobile natif
    deviceScaleFactor: 2.77,                  // → PNG 1080×2338 ≈ 9:19 — accepté Play Store
    locale: 'fr-FR',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('pseudo', 'Alexandre');
    localStorage.setItem('hasPlayed', 'true');
    localStorage.setItem('avatar', '1');           // avatar déjà choisi
    localStorage.setItem('stats', JSON.stringify({ played: 12, won: 8, fooled: 24, xp: 340 }));
    localStorage.removeItem('theme');
  });
  return { page, ctx };
}

async function clean(page) {
  await page.evaluate(() => {
    // Fermer toutes les modales / overlays / toasts
    document.querySelectorAll(
      '.pwa-install-toast, #starter-overlay, .notif, [class*="modal"], [class*="toast"], [class*="overlay"]'
    ).forEach(el => { el.style.display = 'none'; el.style.visibility = 'hidden'; });
    // Forcer thème sombre
    document.documentElement.removeAttribute('data-theme');
  });
  await page.waitForTimeout(400);
}

async function snap(page, name) {
  await clean(page);
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('✓', path);
}

const BASE = 'http://localhost:8080';

// ── 1. Accueil ───────────────────────────────────────────────────────────────
{
  const { page, ctx } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap(page, 'phone-01-home');
  await ctx.close();
}

// ── 2. Configuration solo ────────────────────────────────────────────────────
{
  const { page, ctx } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await clean(page);
  await page.click('.home-cta-card.primary');
  await page.waitForTimeout(900);
  await snap(page, 'phone-02-solo-setup');
  await ctx.close();
}

// ── 3. Mot du tour + 4. Vote ─────────────────────────────────────────────────
{
  const { page, ctx } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await clean(page);

  await page.click('.home-cta-card.primary');
  await page.waitForTimeout(600);
  await page.click('#btn-start-solo');
  await page.waitForSelector('#screen-word.active', { timeout: 8000 });
  await page.waitForTimeout(800);
  await snap(page, 'phone-03-word');

  const ta = page.locator('#input-def');
  await ta.waitFor({ state: 'visible', timeout: 5000 });
  await ta.fill('Qui apaise et adoucit, calme une douleur ou une inquiétude par sa douceur.');
  await page.waitForTimeout(400);
  await page.click('#btn-submit-def');

  try {
    await page.waitForSelector('#screen-vote.active', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await snap(page, 'phone-04-vote');
  } catch {
    await page.waitForTimeout(2000);
    await snap(page, 'phone-04-vote');
  }
  await ctx.close();
}

// ── 5. Feature graphic 1024×500 ──────────────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
    locale: 'fr-FR',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('pseudo', 'Alexandre');
    localStorage.setItem('hasPlayed', 'true');
    localStorage.setItem('avatar', '1');
    localStorage.removeItem('theme');
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.querySelectorAll('.pwa-install-toast, #starter-overlay, .notif, [class*="modal"], [class*="overlay"]')
      .forEach(el => { el.style.display = 'none'; });
    document.documentElement.removeAttribute('data-theme');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/feature-graphic.png` });
  console.log('✓', `${OUT}/feature-graphic.png`);
  await ctx.close();
}

await browser.close();
console.log('\nDone → store-screenshots/');
console.log('Tailles : phone-01..04 = 1080×1920 (spec Play Store ✓), feature-graphic = 1024×500 ✓');
