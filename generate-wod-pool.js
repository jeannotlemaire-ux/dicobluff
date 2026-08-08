// generate-wod-pool.js — régénère wod-pool.json à partir du tableau WORDS de game.html.
//
// game.html est la source de vérité unique du dictionnaire : ce script ne fait
// qu'extraire le sous-ensemble utile au widget "mot du jour" de la landing page
// (index.html), qui charge wod-pool.json en fetch() différé.
//
// À relancer à chaque fois que le tableau WORDS de game.html change (mot
// ajouté/retiré/modifié parmi les registres epic/legendary) :
//   node generate-wod-pool.js
//
// Le fichier généré ne contient que {w, d} : le registre (r) et l'étymologie (h)
// ne sont pas utilisés par le widget, donc pas exportés. L'ORDRE du tableau est
// préservé tel quel — le widget recalcule le même index que game.html à partir
// de ce même ordre, un tri le romprait.

const fs = require('fs');
const path = require('path');

const GAME_HTML = path.join(__dirname, 'game.html');
const OUT_JSON = path.join(__dirname, 'wod-pool.json');

const src = fs.readFileSync(GAME_HTML, 'utf8');

const startMarker = 'const WORDS = [';
const start = src.indexOf(startMarker);
if (start === -1) throw new Error('Tableau WORDS introuvable dans game.html');

// Recherche de la fermeture du tableau par comptage de crochets (le tableau
// contient des chaînes avec apostrophes échappées mais jamais de crochets
// littéraux dans le texte des mots/définitions/hints).
let depth = 0, i = start + startMarker.length - 1, end = -1;
for (; i < src.length; i++) {
  const c = src[i];
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end === -1) throw new Error('Fin du tableau WORDS introuvable');

const arrayLiteral = src.slice(start + 'const WORDS = '.length, end);
// eslint-disable-next-line no-new-func
const WORDS = new Function('return ' + arrayLiteral)();

const pool = WORDS
  .filter(w => w.r === 'epic' || w.r === 'legendary')
  .map(w => ({ w: w.w, d: w.d }));

fs.writeFileSync(OUT_JSON, JSON.stringify(pool), 'utf8');
console.log(`✓ wod-pool.json régénéré : ${pool.length} mots (epic + legendary) depuis game.html`);
