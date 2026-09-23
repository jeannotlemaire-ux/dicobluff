// build.js — copie les assets web dans www/ pour Capacitor
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT = path.join(__dirname, 'www');

// game.html → www/index.html pour Capacitor ; index.html = landing web uniquement
const FILES = ['sw.js', 'manifest.webmanifest', 'offline.html', 'privacy.html'];
const DIRS  = ['assets', 'new-avatars'];

// Exclus du bundle : PNG sources des avatars (remplacés par .webp), logo 1024px (→ logo-192.png), doublons/brouillons assets
const EXCLUDE = new Set([path.join('assets', 'logo.png'), path.join('assets', '1 - copie.png'), path.join('assets', 'logo.png.png')]);
const isExcluded = (rel) => EXCLUDE.has(rel) || (rel.startsWith('new-avatars' + path.sep) && rel.endsWith('.png'));

function copyDir(src, dst, rel = path.basename(src)) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    const r = path.join(rel, entry.name);
    if (entry.isDirectory()) copyDir(s, d, r);
    else if (!isExcluded(r)) fs.copyFileSync(s, d);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Capacitor entry point = le jeu, pas la landing page
const gameSrc = path.join(SRC, 'game.html');
if (fs.existsSync(gameSrc)) { fs.copyFileSync(gameSrc, path.join(OUT, 'index.html')); console.log('  ✓ game.html → www/index.html'); }
else console.warn('  ⚠ manquant: game.html');

for (const f of FILES) {
  const src = path.join(SRC, f);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(OUT, f)); console.log('  ✓', f); }
  else console.warn('  ⚠ manquant:', f);
}

for (const d of DIRS) {
  const src = path.join(SRC, d);
  if (fs.existsSync(src)) { copyDir(src, path.join(OUT, d)); console.log('  ✓', d + '/'); }
  else console.warn('  ⚠ manquant:', d);
}

console.log('\nwww/ prêt pour Capacitor →', OUT);
