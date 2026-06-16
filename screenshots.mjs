import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = './store-screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function newPage() {
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2.5,
    locale: 'fr-FR',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('pseudo', 'Joueur');
    localStorage.setItem('hasPlayed', 'true');
    localStorage.setItem('avatar', '0');
    localStorage.removeItem('theme');
  });
  return { page, ctx };
}

async function clean(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.pwa-install-toast, #starter-overlay, .notif').forEach(el => el.style.display = 'none');
    document.documentElement.removeAttribute('data-theme');
  });
  await page.waitForTimeout(300);
}

async function snap(page, name) {
  await clean(page);
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('✓', path);
}

// ── 1. Home ──────────────────────────────────────────────────────────
{
  const { page, ctx } = await newPage();
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap(page, 'portrait__01-home');
  await ctx.close();
}

// ── 2. Solo setup + game word + vote — même page, on navigue ─────────
{
  const { page, ctx } = await newPage();
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Fermer overlay si présent
  await page.evaluate(() => {
    document.querySelectorAll('#starter-overlay').forEach(el => el.classList.remove('open'));
    document.documentElement.removeAttribute('data-theme');
  });
  await page.waitForTimeout(300);

  // Cliquer Jouer Solo
  await page.click('.home-cta-card.primary');
  await page.waitForTimeout(800);
  await snap(page, 'portrait__02-solo-setup');

  // Lancer la partie
  await page.click('#btn-start-solo');
  // Attendre l'écran du mot
  await page.waitForSelector('#screen-word.active', { timeout: 8000 });
  await page.waitForTimeout(1000);
  await snap(page, 'portrait__03-game-word');

  // Entrer une définition et soumettre
  const ta = page.locator('#input-def');
  await ta.waitFor({ state: 'visible', timeout: 5000 });
  await ta.fill('Action de naviguer prudemment le long d\'une côte sans la perdre de vue.');
  await page.waitForTimeout(500);
  await page.click('#btn-submit-def');

  // Attendre l'écran de vote
  try {
    await page.waitForSelector('#screen-vote.active', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await snap(page, 'portrait__04-vote');
  } catch(e) {
    // Si le vote ne charge pas (partie solo saute directement), screenshot quand même
    await page.waitForTimeout(2000);
    await snap(page, 'portrait__04-vote');
  }

  await ctx.close();
}

// ── 5. Feature graphic 1024×500 ──────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
    locale: 'fr-FR',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('pseudo', 'Joueur');
    localStorage.setItem('hasPlayed', 'true');
    localStorage.setItem('avatar', '0');
    localStorage.removeItem('theme');
  });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.pwa-install-toast, #starter-overlay, .notif').forEach(el => el.style.display = 'none');
    document.documentElement.removeAttribute('data-theme');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/feature-graphic__1024x500.png` });
  console.log('✓', `${OUT}/feature-graphic__1024x500.png`);
  await ctx.close();
}

await browser.close();
console.log('\nDone → store-screenshots/');
