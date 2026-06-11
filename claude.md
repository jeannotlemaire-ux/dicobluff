# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Dicobluff est un jeu de bluff de définitions (style Balderdash) entièrement en français. Un mot rare est affiché, les joueurs inventent de fausses définitions pour tromper leurs adversaires, puis votent pour la vraie. Mode solo vs IA et multijoueur prévu.

## Architecture

Le jeu tient dans un **fichier unique `index.html`** (~9 800 lignes) qui contient CSS, HTML et JavaScript en ligne. Il n'y a pas de bundler, pas de framework, pas de build step.

Structure interne de `index.html` (dans l'ordre) :
1. **Design system CSS** (lignes ~44–350) — variables CSS (`--bg`, `--gold`, `--cream`…), utilitaires `.t-label`, `.stack`, etc.
2. **Styles des composants** (lignes ~350–3 900) — chaque écran a sa section CSS délimitée par un bandeau `═══`.
3. **HTML des écrans** (lignes ~3 900–5 200) — les écrans sont des `<div id="screen-*" class="screen">` empilés ; un seul est visible à la fois via `showScreen(id)`.
4. **JavaScript** (lignes ~5 200–9 795) — tout en vanilla JS, organisé en blocs `═══` thématiques :
   - `LS` : wrapper localStorage (`LS.get`, `LS.set`)
   - `WORDS` : tableau d'objets `{w, d, r, h}` — mot, définition, registre, hint
   - `AI_CHARACTERS` : tableau des personnages IA adversaires (Dantès, Don Juan, Esmeralda…) avec `voteStrategy` et `reactions`
   - `solo {}` : état de la partie solo en cours
   - `App` : contrôleur principal (`App.startSolo`, `App.nextRound`, etc.)
   - Système XP/niveaux, avatars débloquables (`AV_DEFS`, `checkCond`, `onAvatarUnlocked`)
   - Chat IA avec typewriter (`pushAIChatMessage`)
   - Lottie animations (`LOTTIE_BURST`, `LOTTIE_SUCCESS`, `LOTTIE_DOTS`, `fireBurst`, `showSuccessCheck`)
   - `PWA` : module d'installation PWA avec toast

Fichiers complémentaires :
- `sw.js` — Service Worker (stale-while-revalidate pour HTML, cache-first pour assets, bypass Firebase)
- `manifest.webmanifest` — config PWA (catégories : games, education, entertainment)
- `new-avatars/` — portraits PNG des personnages littéraires (avatars joueur)
- `assets/icons/` — icônes PWA toutes tailles

## Développement

Ouvrir `index.html` directement dans un navigateur fonctionne pour la majorité des fonctionnalités. Pour tester le Service Worker et l'installation PWA, il faut un serveur local :

```
# Python (disponible sur la plupart des systèmes)
python -m http.server 8080

# Node.js
npx serve .
```

Puis ouvrir `http://localhost:8080`.

Il n'y a pas de tests automatisés. La validation de la base de mots s'exécute au démarrage dans la console (`validateWords()`).

## Conventions importantes

**Design system** — toujours utiliser les variables CSS du `:root`, jamais de valeurs en dur. Palette : marine `#0E1A22`, crème `#F5EDD8`, or `#C8860A`, coral `#D94F3F`, teal `#2A9D8F`. Typo : `Cormorant Garamond` pour les titres/mots, `Manrope` pour l'UI.

**Écrans** — chaque écran est un `<div id="screen-X" class="screen">`. La navigation se fait via `showScreen('screen-id')`. Ne jamais manipuler `display` directement sur un écran.

**Mots** — chaque entrée `WORDS` : `{ w: string, d: string, r: string, h: string }` (mot, définition, registre parmi `'litteraire'|'scientifique'|'philosophique'|'absurde'`, hint/étymologie).

**Personnages IA** — chaque entrée `AI_CHARACTERS` : `{ id, name, color, title, desc, bank, voteStrategy(defs, realIdx, diff), reactions: {correct, wrong, fooled, notfooled} }`.

**localStorage** — tout passe par `LS.get(key, default)` / `LS.set(key, value)`. Clés existantes : `pseudo`, `stats`, `carnet`, `pending`, `pwa_snoozed_until`, `hasPlayed`.

**Service Worker** — incrémenter `CACHE_VERSION` dans `sw.js` à chaque déploiement pour invalider le cache.

## Ce qui n'est pas encore implémenté

- Multijoueur en temps réel (le SW bypasse déjà les domaines Firebase — l'infrastructure est prévue mais pas codée)
- Backend / comptes joueurs
- Publication stores (nécessite Capacitor ou wrapper natif)
