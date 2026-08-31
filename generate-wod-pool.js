// generate-wod-pool.js — régénère le bloc WOD-DATA d'index.html à partir du
// tableau WORDS de game.html.
//
// game.html est la source de vérité unique du dictionnaire. Ce script calcule,
// pour chaque jour des 30 prochains jours, EXACTEMENT le même mot que game.html
// afficherait ce jour-là (même pool legendary dans le même ordre, même rotation
// par cycle mélangé), puis injecte ces 30 paires {jour, mot, définition}
// DIRECTEMENT dans index.html, entre les marqueurs <!-- WOD-DATA:START --> et
// <!-- WOD-DATA:END -->. Aucun fetch, aucun fichier externe : le site n'a plus
// aucune dépendance réseau pour ce widget.
//
// Pourquoi 30 jours et pas les 667 mots en entier : embarquer le pool complet
// gonflerait inutilement le poids de la landing page (SEO/vitrine). 30 jours
// couvre largement l'intervalle entre deux relances de ce script.
//
// À RELANCER TOUS LES 30 JOURS (sinon le site retombe sur la 1ère entrée du
// bloc au-delà de la fenêtre couverte — dégradation silencieuse, pas de crash,
// mais le mot du jour du site cesse de coller à celui de l'app) :
//   node generate-wod-pool.js
//
// Automatisation possible plus tard : un workflow GitHub Actions avec un
// déclencheur `schedule` (cron mensuel, ex. "0 6 1 * *") qui checkout le repo,
// lance `node generate-wod-pool.js`, puis commit+push automatiquement si le
// bloc a changé. Pas mis en place ici — à faire dans .github/workflows/ le
// jour où on veut ne plus y penser.

const fs = require('fs');
const path = require('path');

const GAME_HTML = path.join(__dirname, 'game.html');
const INDEX_HTML = path.join(__dirname, 'index.html');
const DAYS_AHEAD = 30;
const START_MARKER = '<!-- WOD-DATA:START — généré par generate-wod-pool.js depuis game.html, NE PAS ÉDITER À LA MAIN -->';
const END_MARKER = '<!-- WOD-DATA:END -->';

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

// Même formule que WOD_ORDER/wodWordForDay() dans game.html : un ordre de
// rotation FIXE (mélange déterministe, calculé une seule fois), indexé par
// dayIdx % poolSize. La séquence est donc purement périodique (période =
// poolSize) : n'importe quelle fenêtre de poolSize jours consécutifs, quel que
// soit son jour de départ, contient chaque mot du pool exactement une fois.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWodOrder(poolSize) {
  const rnd = mulberry32(0x9E3779B9);
  const order = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  return order;
}

function wodIndexForDay(dayIdx, wodOrder) {
  const n = wodOrder.length;
  const pos = ((dayIdx % n) + n) % n;
  return wodOrder[pos];
}

// Index du jour Europe/Paris pour un instant UTC donné — indépendant du fuseau
// de la machine qui exécute ce script (un runner CI est typiquement en UTC).
// Reproduit l'arithmétique de localDayIdx() (game.html/index.html), qui elle
// tourne dans le navigateur du joueur et utilise donc SON fuseau local — pour
// une audience française, Europe/Paris est la bonne approximation au moment
// de choisir QUELS 30 jours pré-calculer.
function parisDayIdx(utcDate) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(utcDate).map(x => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.floor(asUtc / 86400000);
}

const gameHtmlSrc = fs.readFileSync(GAME_HTML, 'utf8');
const WORDS = extractWords(gameHtmlSrc);
// Dédupliqué par texte du mot : quelques entrées légendaires du dictionnaire
// existent deux fois avec des définitions légèrement différentes — on garde la
// première occurrence, comme WOD_POOL dans game.html.
const seen = new Set();
const pool = [];
for (const w of WORDS) {
  if (w.r !== 'legendary' || seen.has(w.w)) continue;
  seen.add(w.w);
  pool.push(w);
}
const wodOrder = buildWodOrder(pool.length);

const todayIdx = parisDayIdx(new Date());
const days = [];
for (let offset = 0; offset < DAYS_AHEAD; offset++) {
  const dayIdx = todayIdx + offset;
  const wIdx = wodIndexForDay(dayIdx, wodOrder);
  const w = pool[wIdx];
  days.push({ day: dayIdx, w: w.w, d: w.d });
}

const block = `${START_MARKER}
<script>
const WOD_DAYS = ${JSON.stringify(days)};
</script>
${END_MARKER}`;

const indexSrc = fs.readFileSync(INDEX_HTML, 'utf8');
const startIdx = indexSrc.indexOf(START_MARKER);
const endIdx = indexSrc.indexOf(END_MARKER);
if (startIdx === -1 || endIdx === -1) {
  throw new Error('Marqueurs WOD-DATA introuvables dans index.html — voir generate-wod-pool.js pour le format attendu.');
}
const newIndexSrc = indexSrc.slice(0, startIdx) + block + indexSrc.slice(endIdx + END_MARKER.length);
fs.writeFileSync(INDEX_HTML, newIndexSrc, 'utf8');

console.log(`✓ index.html mis à jour : ${days.length} jours injectés (du ${days[0].day} au ${days[days.length - 1].day}), mot du jour = "${days[0].w}"`);
