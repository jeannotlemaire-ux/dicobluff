// build.js — copie les assets web dans www/ pour Capacitor
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT = path.join(__dirname, 'www');

const FILES = ['index.html', 'sw.js', 'manifest.webmanifest', 'offline.html', 'privacy.html'];
const DIRS  = ['assets', 'new-avatars'];

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

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
