/* ══════════════════════════════════════════════════════
   📅 MOT DU JOUR — implémentation UNIQUE

   Chargé tel quel par game.html (le jeu), index.html (le site) et
   generate-wod-pool.js (Node). Personne d'autre ne doit recalculer le mot du
   jour : toute divergence entre le jeu et le site vient forcément d'une copie
   de cette logique. Ne rien dupliquer, tout passe par DicoWOD.
══════════════════════════════════════════════════════ */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DicoWOD = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // Pool du mot du jour : uniquement les mots légendaires (les plus difficiles),
  // dédupliqué par texte du mot (quelques entrées légendaires du dictionnaire
  // existent deux fois avec des définitions légèrement différentes — on garde la
  // première occurrence pour garantir qu'un même mot n'apparaît jamais deux fois
  // dans la rotation).
  function buildPool(words) {
    const seen = new Set();
    const out = [];
    for (const w of words) {
      if (w.r !== 'legendary' || seen.has(w.w)) continue;
      seen.add(w.w);
      out.push(w);
    }
    return out;
  }

  // PRNG déterministe (mulberry32), utilisé une seule fois pour calculer l'ordre
  // de rotation ci-dessous.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Index du jour = nombre de jours depuis l'epoch en heure LOCALE (pas UTC)
  // → garantit qu'à minuit local on bascule de mot, peu importe le fuseau.
  function localDayIdx(date) {
    const n = date || new Date();
    return Math.floor((n.getTime() - n.getTimezoneOffset() * 60000) / 86400000);
  }

  // `pool` = résultat de buildPool(). Ordre de rotation FIXE (mélange
  // déterministe du pool, calculé une seule fois). Le mot d'un index de jour
  // dIdx est order[dIdx mod pool.length] : la séquence est purement périodique,
  // de période pool.length. Conséquence : N'IMPORTE QUELLE fenêtre de
  // pool.length jours consécutifs — quel que soit son jour de départ — contient
  // chaque mot du pool EXACTEMENT une fois.
  function create(pool) {
    const rnd = mulberry32(0x9E3779B9);
    const order = pool.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    // Mot du jour pour un index de jour donné (peut être négatif). Déterministe :
    // même dIdx → toujours le même mot.
    function wordForDay(dIdx) {
      const n = order.length;
      return pool[order[((dIdx % n) + n) % n]];
    }
    return { pool, wordForDay, today: () => wordForDay(localDayIdx()) };
  }

  return { buildPool, create, localDayIdx };
});
