// generate-wod-pool.js — régénère wod-pool.js à partir du tableau WORDS de
// game.html.
//
// game.html est la source de vérité unique du dictionnaire, wod.js celle de
// l'algorithme du mot du jour. Le site (index.html) ne peut pas charger les
// 1 000 mots de game.html : ce script en extrait le pool du mot du jour
// (DicoWOD.buildPool, la même fonction que le jeu) et l'écrit dans wod-pool.js.
// Le site calcule ensuite le mot à la volée avec wod.js, exactement comme le
// jeu.
//
// Le fichier généré ne contient AUCUNE date : il n'expire jamais. Il ne change
// que si les mots légendaires de game.html changent. Relancé automatiquement
// par `npm run build` et par le workflow GitHub Actions à chaque push qui
// touche game.html ou wod.js (.github/workflows/wod-pool-refresh.yml).
//
//   node generate-wod-pool.js           régénère wod-pool.js
//   node generate-wod-pool.js --check   échoue (code 1) si wod-pool.js est périmé

const fs = require('fs');
const path = require('path');
const DicoWOD = require('./wod.js');

const GAME_HTML = path.join(__dirname, 'game.html');
const POOL_JS = path.join(__dirname, 'wod-pool.js');

function extractWords(gameHtmlSrc) {
  const startMarker = 'const WORDS = [';
  const start = gameHtmlSrc.indexOf(startMarker);
  if (start === -1) throw new Error('Tableau WORDS introuvable dans game.html');

  let depth = 0, i = start + startMarker.length - 1, end = -1;
  for (; i < gameHtmlSrc.length; i++) {
    const c = gameHtmlSrc[i];
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) throw new Error('Fin du tableau WORDS introuvable');

  const arrayLiteral = gameHtmlSrc.slice(start + 'const WORDS = '.length, end);
  // eslint-disable-next-line no-new-func
  return new Function('return ' + arrayLiteral)();
}

const WORDS = extractWords(fs.readFileSync(GAME_HTML, 'utf8'));
// Seuls le mot et sa définition partent sur le site ; l'ORDRE du pool est
// conservé tel quel, la rotation de wod.js en dépend.
const pool = DicoWOD.buildPool(WORDS).map(w => ({ w: w.w, d: w.d }));

const out = `// GÉNÉRÉ par generate-wod-pool.js depuis game.html — NE PAS ÉDITER À LA MAIN.
// Pool du mot du jour pour le site (index.html) ; l'ordre compte, voir wod.js.
self.WOD_POOL_DATA = ${JSON.stringify(pool)};
`;

// Sous Windows, git peut restituer le fichier en CRLF : on compare en LF.
const current = fs.existsSync(POOL_JS) ? fs.readFileSync(POOL_JS, 'utf8').replace(/\r\n/g, '\n') : '';
const today = DicoWOD.create(pool).today().w;

if (process.argv.includes('--check')) {
  if (current !== out) {
    console.error('✗ wod-pool.js est périmé par rapport à game.html — lancer `node generate-wod-pool.js`.');
    process.exit(1);
  }
  console.log(`✓ wod-pool.js à jour (${pool.length} mots, mot du jour = "${today}")`);
} else if (current === out) {
  console.log(`✓ wod-pool.js déjà à jour (${pool.length} mots, mot du jour = "${today}")`);
} else {
  fs.writeFileSync(POOL_JS, out, 'utf8');
  console.log(`✓ wod-pool.js régénéré : ${pool.length} mots, mot du jour = "${today}"`);
}
