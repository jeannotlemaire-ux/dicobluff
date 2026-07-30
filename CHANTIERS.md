# Dicobluff — Chantiers techniques

Spec unique issue d'un audit growth/produit. **Ce fichier est la seule source de vérité.** Il remplace `CHANTIER-1.4-COHERENCE.md` et `CHANTIERS-REVISION-3-ET-6.md`, qui doivent être supprimés du repo.

## État d'avancement

| # | Chantier | Statut |
|---|---|---|
| 1 | Déblocage immédiat (quota, bypass paywall, carnet) | ✅ **fait** |
| 1.4 | Cohérence site & fiche Play | ✅ **fait** — Partie A (`index.html`) faite ; Partie B (Play Console) reste manuelle, hors repo |
| 2 | Instrumentation analytics | ✅ **fait** — code only ; Data Safety Play Console reste manuel, hors repo |
| 3 | Nettoyage du mode décalé abandonné | ⬜ **prochain** |
| 4 | Surfaces de partage | ⬜ |
| 5 | Ajustements d'interface | ⬜ |
| 6 | Leurres par emprunt (amélioration) | ⬜ après 10 jours de données du chantier 2 |

**Ordre d'exécution :** `1 → 1.4 → 2 → 3 → 4 → 5 → 6`

Le chantier 2 est prioritaire : le chantier 1 vient de modifier le produit en profondeur, et chaque jour sans instrumentation est un jour de comportement post-chantier-1 impossible à reconstituer.

## Contexte technique

- `game.html` : PWA single-file, ~13 800 lignes. Tout est dedans (CSS, HTML, JS).
- `index.html` : site vitrine, également single-file.
- Empaquetage Android via **Capacitor**. Billing via **cordova-plugin-purchase** (`CdvPurchase`).
- Backend : **Firebase Realtime Database** + auth anonyme (`signInAnonymously`).
- Persistance locale via un helper `LS` (wrapper localStorage).

## Règles impératives

1. **Aucun refactor.** Pas de reformatage, pas de découpage en modules, pas de renommage. Édits chirurgicaux uniquement.
2. **Les numéros de ligne sont indicatifs et se décalent après chaque édit.** Localise toujours par nom de fonction ou par contenu, jamais par numéro de ligne.
3. **Ne casse pas le mode hors ligne.** Le jeu revendique « 100 % hors ligne » sur le store et le site. Aucun appel réseau ne doit être requis pour jouer en solo.
4. **Ne casse pas la CSP** (`<meta http-equiv="Content-Security-Policy">`, `game.html` ~ligne 6). Toute nouvelle origine réseau doit y être ajoutée explicitement.
5. **Un commit par chantier**, message explicite. Ne mélange jamais deux chantiers.
6. **Ne traite qu'un seul chantier par session**, celui qui est demandé. N'anticipe pas les suivants.
7. Après chaque chantier : le jeu se lance, une partie solo va jusqu'au podium, aucune erreur console.

---

# Chantier 1 — Déblocage immédiat ✅ FAIT

Conservé pour référence. Ne pas réappliquer.

- `DAILY_FREE_GAMES` passé à `999` (la fonction `canPlayToday()` et ses 3 points d'appel sont conservés pour pouvoir réintroduire un quota plus tard).
- `triggerPremiumPurchase()` : la branche non-native ne déverrouille plus Premium ; déverrouillage direct réservé à `localhost` / `127.0.0.1`.
- Carnet de mots sorti du paywall. **Seul le mode Révision reste Premium.**

---

# Chantier 1.4 — Cohérence site & fiche Play

**Statut à confirmer avant de commencer :** vérifier dans `index.html` si les points ci-dessous sont déjà appliqués. Si oui, passer au chantier 2.

**Pourquoi :** le chantier 1 a rendu gratuits le Carnet et les parties illimitées. Trois surfaces annoncent encore ces éléments comme Premium. Un décalage entre la promesse et le produit est le premier générateur d'avis 1 étoile.

## Partie A — `index.html`

### A.1 Carte Premium, section MODES (~ligne 1520)

- Titre `Carnet & Révision` → `Mode Révision`
- Description → « Transforme tes parties en apprentissage réel. Les mots que tu découvres reviennent sous forme de quiz, jusqu'à ce qu'ils soient acquis. »
- Les 4 puces → `Quiz de révision adaptatif`, `Suivi de progression par mot`, `Répétition espacée`, `Défis sur les mots légendaires`

> Vérifier d'abord dans `game.html` que ces fonctionnalités existent réellement dans le mode Révision. Si l'une manque, le signaler et proposer un intitulé exact plutôt que d'inventer. **Ne rien annoncer qui n'existe pas** — c'est l'erreur qu'on corrige.

### A.2 Carte Solo gratuite (~ligne 1499)

Ajouter `Parties illimitées` en première puce : la contrainte levée devient un argument de vente. Vérifier que la carte à 5 puces reste alignée visuellement avec les deux autres.

### A.3 Section « Un jeu qui cultive » (~1436-1480)

Les 3 blocs `.carnet-feat` mélangent gratuit et Premium sans distinction. Ajouter un marqueur `✦ Premium` discret sur le **seul** bloc « Révision active », en réutilisant la classe `.badge-premium` (~ligne 606). Ne pas toucher aux deux autres blocs.

### A.4 Nombre de joueurs (préexistant)

Le site annonce « 2 à 8 joueurs », `game.html` autorise 10 (`joinRoom()` : « Salon complet (10 max) »). Corriger partout — `grep` sur `2 à 8` et `8 joueurs`.

### A.5 « Pas de tutoriel » (préexistant)

~Ligne 1545 : un tutoriel de 3 slides s'affiche au premier lancement, la phrase est fausse. → « Pas de compte, pas d'inscription. »

### A.6 Étoiles fictives (préexistant)

Ligne ~1696, `.dl-note` : supprimer `★★★★★`, garder le reste du texte. L'app n'a **aucune note** sur le Play Store ; afficher 5 étoiles est trompeur, et le visiteur le découvre en arrivant sur la fiche. Vérifier qu'aucune autre note fictive ne traîne ailleurs.

### A.7 Hero — compteurs

Les 3 compteurs `.hero-stats` font concurrence à la carte de vote interactive juste à côté, qui est bien plus convaincante. Garder uniquement « 1 000 mots rares », supprimer « 12 personnages » et « 100 % hors ligne » (l'info hors-ligne est déjà dans `.trust-line` juste en dessous). Ajuster l'espacement.

**Ne modifier ni la palette, ni les polices, ni la carte de vote du hero (`#vote-card`)** : c'est le meilleur élément de la page.

### A.8 Scroll

`html { scroll-behavior: smooth }` est global, avec 10 sections ancrées : c'est lent et ça ignore les préférences d'accessibilité. Le placer dans un `@media (prefers-reduced-motion: no-preference)`.

## Partie B — Play Console (manuel, hors repo)

À faire **dans la même release** que le build du chantier 1, sinon l'app et la fiche divergent pendant la review.

- **B.1 Description longue.** Les mentions `unlimited play` et `Word Book` deviennent fausses. Mettre à jour **la locale `fr-FR` et la locale par défaut `en-US`**.
- **B.2 Produit `premiumunlock`.** Son titre et sa description vivent dans la Console et s'affichent sur l'écran de paiement Google. S'ils promettent encore les parties illimitées, tu vends 2,99 € quelque chose que l'acheteur possède déjà. Titre cible : `Mode Révision`.
- **B.3 Data Safety.** À traiter avec le chantier 2 (voir ci-dessous).

**Commit :** `docs: mise à jour du site pour refléter le nouveau périmètre Premium`

---

# Chantier 2 — Instrumentation analytics

**Objectif :** pouvoir mesurer la rétention. À traiter **isolément**, sans aucun autre changement dans le commit.

## Implémentation

- Utiliser **Firebase Analytics**. Le SDK Firebase est déjà chargé pour la Realtime Database : **réutiliser l'app initialisée**, ne pas en créer une seconde.
- Ajouter l'origine nécessaire à la CSP si le SDK en requiert une nouvelle.
- Helper unique et défensif, à appeler partout ailleurs :

```js
function track(name, params){
  try { /* firebase analytics logEvent */ } catch(e){}
}
```

Le `try/catch` est impératif : un échec d'analytics ne doit jamais casser une partie, notamment hors ligne.

## Les 8 événements — pas un de plus

| Événement | Point de déclenchement | Paramètres |
|---|---|---|
| `app_open` | init de l'app | `is_premium` |
| `tutorial_done` | `App.skipTutorial()` et fin du tutoriel | `skipped` (bool) |
| `game_start` | `startSoloGame()` et `startGame()` online | `mode` (`solo`\|`online`), `nb_ai` |
| `round_definition_submitted` | soumission d'une définition par le joueur | `round`, `word_rarity` |
| `game_complete` | affichage de l'écran final / podium | `mode`, `rounds`, `score`, `won` (bool) |
| `daily_limit_hit` | `showDailyLimitModal()` | — (doit rester à 0 depuis le chantier 1 ; garde-fou) |
| `paywall_view` | `showPremiumModal()` | `source` (`revision`\|`settings`\|…) |
| `purchase` | callback de succès de `CdvPurchase` | `product_id` |

## Data Safety — impératif

La fiche Play déclare « No data collected ». Cette déclaration devient fausse dès la mise en production. **Mettre à jour le formulaire Data Safety dans la même release**, pas après : le non-respect de la déclaration est un motif de suspension.

**Commit :** `feat: instrumentation analytics (8 événements)`

---

# Chantier 3 — Nettoyage du mode décalé abandonné

**Contexte.** Un mode « décalé » a été envisagé puis abandonné : la vraie définition y était une version humoristique, parfois grivoise, du mot. Le mode n'est plus joignable (`gameMode` forcé à `'classic'` en ~10097, ~10956, ~11234), mais toutes ses données et son code sont encore embarqués.

**Enjeu mesuré :**

| Élément | Poids / effet |
|---|---|
| Champ `funDef` — **1 000 entrées, jamais affichées** | **115 Ko, 13 % du fichier** |
| `banks.absurde` — 45 textes injoignables (utilisée seulement si `gameMode === 'decale'`, ~ligne 11649) | 8,6 Ko |
| Rareté `r:'fun'` → libellé « Décalé » (~10666) | 0 mot l'utilise |
| Branches `isDecale` (~12670-12676, ~12694, ~12794) | code mort |
| `'decale'` dans la validation (~11091) | code mort |
| Écriture `currentFunDef` dans Firebase (~11307, ~13046) | écriture inutile à chaque manche, chaque salon |

Une app classée **« Rated for 3+ »** sur le Play Store ne devrait pas embarquer de contenu grivois, même inatteignable.

## 3.1 — Archiver les `funDef` avant de les supprimer

Ces 1 000 définitions représentent un travail d'écriture réel. **Ne pas les perdre.**

1. Script Node ou Python extrayant, depuis le tableau de mots de `game.html`, un JSON `archive/funDefs.json` de la forme `[{ "w": "...", "funDef": "..." }, ...]`.
2. Committer ce fichier **sans le charger** depuis `game.html` ni le référencer dans le service worker. C'est une archive, pas une ressource.
3. Vérifier qu'il contient bien **1 000 entrées** et qu'il est parsable, avant de passer à l'étape suivante.

## 3.2 — Retirer le champ `funDef` du dictionnaire

**Opération la plus risquée du plan.** Les chaînes contiennent des apostrophes échappées (`h:'D\'Abdère, cité de Thrace…'`) et des guillemets internes. Un regex naïf corrompra silencieusement des entrées.

Procédure imposée :

1. **Compter avant :** occurrences de `{w:"` et de `funDef:`. Noter les deux chiffres.
2. Script de transformation gérant les échappements (`\"`, `\'`, `\\`). **Ni édition manuelle, ni simple `sed`.**
3. **Compter après :** `{w:"` doit être **identique** (1 000), `funDef:` doit être **0**.
4. **Valider par parsing :** charger le tableau de mots et vérifier que les 1 000 entrées ont `w`, `d`, `r`, `h` non vides. Toute entrée cassée fait échouer la validation.
5. Diff relu sur au moins 10 entrées au hasard, **dont une contenant une apostrophe échappée**.

En cas de doute à n'importe quelle étape : s'arrêter et le signaler plutôt que de commiter.

## 3.3 — Retirer le code mort associé

- Supprimer `banks.absurde` en entier.
- ~11649 : `const pool = banks[aiChar.bank] || banks.litteraire;`
- ~11650 : `cacheKey` réduit à `aiChar.id`. **Attention :** cela invalide les clés `*_decale` déjà persistées dans `_aiUsedDefs` chez les joueurs existants. Vérifier que le chargement tolère une clé inconnue sans lever d'erreur.
- Supprimer les branches `isDecale` (~12670-12676, ~12694, ~12794) en gardant systématiquement la variante classique.
- ~11091 : `if(solo.gameMode !== 'classic') solo.gameMode = 'classic';`
- ~11307 et ~13046 : retirer `currentFunDef` de l'objet écrit dans Firebase.
- ~10666 : retirer l'entrée `fun:'Décalé'` du mapping des raretés.
- Retirer les paramètres `gameMode` devenus inutiles **uniquement s'ils ne sont plus lus nulle part** — vérifier `pickWord`, `aiGenerateDef`, `startSoloRound`.

## 3.4 — Vérifications

- Le fichier doit peser environ **125 Ko de moins**.
- Partie solo complète jusqu'au podium, sans erreur console.
- Partie multijoueur à 2 joueurs, sans erreur console, en vérifiant dans la console Firebase que `currentFunDef` n'apparaît plus dans `rooms/<code>`.
- Carnet et mot du jour fonctionnels (ils lisent `d` et `h`, pas `funDef` — à confirmer).

**Commit :** `chore: suppression du mode décalé abandonné (-125 Ko)`

---

# Chantier 4 — Surfaces de partage

**Objectif :** le jeu fabrique du contenu partageable à chaque manche et n'en capture rien. Aucun partage actuel ne contient d'URL.

## 4.1 Ajouter l'URL à tous les partages

`shareCarnetWord()` (~10707) construit un texte finissant par `#Dicobluff`, sans lien : le destinataire ne peut pas installer le jeu.

- Ajouter `https://www.dicobluff.fr` à **tous** les textes partagés.
- Utiliser le champ `url` de `navigator.share` en plus du texte, et inclure l'URL dans le fallback presse-papiers.

## 4.2 Dégater le partage du carnet

Dans `openCarnetDetail()` (~10685) : `shareEl.style.display = (p >= 3) ? 'flex' : 'none'`.

Rendre le bouton **toujours visible**. Conditionner sa distribution à une maîtrise du mot bride son propre canal d'acquisition. Conserver l'affichage des pastilles de progression.

## 4.3 Partage depuis l'écran de fin de partie

L'écran final (`#final-podium`, `#final-leaderboard`, `#final-stats`, ~6069) n'a **aucun** bouton de partage. C'est le moment de satisfaction maximale et le seul contenu réellement viral du jeu.

Ajouter un bouton « Partager ma partie » générant un texte du type :

```
Sur Dicobluff, j'ai piégé Cyrano et Tartuffe avec ma définition de « Kaïros ».
Score : 340 pts · 3 IA piégées

https://www.dicobluff.fr
```

Reprendre les données déjà calculées dans `#stat-correct` / `#stat-fooled` et le nom des IA piégées. Même mécanique que `shareCarnetWord()`.

## 4.4 Lien d'invitation multijoueur

`copyCode()` (~11282) copie les 4 lettres brutes. Un ami sans l'app reçoit « ABCD » et décroche.

- Copier un message complet : `Rejoins ma partie sur Dicobluff : https://www.dicobluff.fr/?room=ABCD`
- Gérer le paramètre `room` au démarrage, à côté de `?mode=solo` et `?wod=1` (~13229) : si `room` est présent et valide (4 lettres), router vers `App.joinRoom()` avec le code prérempli.
- Respecter la garde existante : pas de deep link tant que le tutoriel n'est pas terminé.

**Commit :** `feat: partage de fin de partie, lien d'invitation multi, URLs dans les partages`

---

# Chantier 5 — Ajustements d'interface

## 5.1 Timing du prompt de notation

L'app a 0 note sur le Play Store, ce qui bloque sa distribution algorithmique. Le bouton existe (`App.doRateApp()`, ~5410) mais le déclenchement n'est pas piloté.

- Déclencher **après une partie gagnée**, et **à partir de la 3ᵉ session seulement**.
- Une seule sollicitation, jamais réaffichée si l'utilisateur a refusé ou noté (drapeau en `LS`).
- Jamais pendant une partie, jamais au premier lancement.

## 5.2 Rétrograder la Partie rapide

Le CTA `App.prepareQuickMatch()` (~5759) occupe un bouton `btn-gold` sur l'accueil. À l'échelle actuelle, la file d'attente est vide en permanence : le joueur essaie, attend, abandonne.

- Passer ce CTA en style secondaire, sous « Créer un salon » et « Rejoindre un salon ».
- **Conserver** le fallback vers le solo (`#queue-fallback-btn`), qui est bien fait.
- À repromouvoir au-delà de ~1 000 utilisateurs actifs mensuels.

**Commit :** `chore: timing du prompt de notation, rétrogradation de la partie rapide`

---

# Chantier 6 — Leurres par emprunt (amélioration)

**Prérequis : 10 jours de données du chantier 2.** C'est le seul chantier qui modifie l'équilibre du jeu ; sans base de comparaison, son effet sera impossible à isoler.

Ce n'est pas un correctif : le jeu fonctionne correctement sans. C'est un gain de profondeur.

**Constat.** `aiGenerateDef()` pioche dans une banque statique de 30 définitions par registre. Deux limites :

1. **Répétition bornée.** Un personnage contribue ~5 définitions par partie ; son pool de 30 s'épuise vers la 6ᵉ partie, puis se réinitialise. Les répétitions deviennent perceptibles pour un joueur régulier.
2. **Aucun couplage morphologique.** Les leurres n'exploitent pas la forme du mot affiché — racines, suffixe, registre apparent. Un joueur qui connaît ses racines grecques et latines n'en tire aucun avantage : le plafond de maîtrise est plus bas qu'il pourrait l'être.

**Principe.** Reprendre l'algorithme déjà implémenté dans le hero du site (`index.html`, `initVoteCard`), dont le commentaire décrit exactement la bonne technique : emprunter comme leurres **de vraies définitions appartenant à d'autres mots du dictionnaire**. Le pool passe de 30 à 1 000, la plausibilité morphologique vient gratuitement, et aucun contenu n'est à écrire.

## 6.1 Sélection

Pour le mot courant `W`, candidats parmi les `d` des autres mots, avec ces filtres :

- **Longueur** proche de `W.d` (±40 %), pour qu'aucune option ne se détache par sa taille.
- **Pas de fuite de racine** : le leurre ne doit contenir ni `W.w` ni son radical (comparer les 5-6 premiers caractères, comme le fait `levenshteinClose`).
- **Pas de quasi-synonyme.** Point critique : sur 1 000 mots rares, certaines paires ont des sens proches. Emprunter la définition de l'un comme leurre de l'autre rendrait la « mauvaise » réponse factuellement correcte — un joueur cultivé aurait raison et le jeu lui dirait qu'il a tort. Garde-fou : recouvrement lexical élevé entre `W.d` et le candidat → rejet. Constituer si besoin une liste d'exclusion manuelle des paires détectées.

## 6.2 Préserver la personnalité des adversaires

Les personnages ont un champ `bank` (`litteraire`, `philosophique`, `scientifique`) qui porte leur identité. Cyrano et Nemo ne doivent pas bluffer pareil.

Le dictionnaire n'a pas de champ de registre — seule la rareté `r` existe. Deux options :

1. **Ajouter un champ `reg`** à chaque mot, en une passe hors-ligne unique (classification en 3 registres, 1 000 entrées). Chaque personnage privilégie ensuite les leurres de son registre. Propre et durable.
2. **Heuristique par mots-clés** sur le texte de la définition, sans toucher aux données. Plus rapide, moins fiable.

**Ne pas trancher seul : proposer les deux et demander l'arbitrage.**

## 6.3 Contraintes

- **Conserver `_aiUsedDefs`** et sa persistance : l'anti-répétition par personnage est bien conçue, elle doit s'appliquer au nouveau pool.
- **Conserver le garde-fou anti-doublon** de `processSoloVotePhase` (`levenshteinClose`, 20 tentatives).
- **Conserver `_aiDefWeight()`** : la logique de vote des IA est indépendante et fonctionne bien.
- **Conserver les banques existantes en repli** quand aucun candidat ne passe les filtres. Ne pas les supprimer.
- **Aucun appel réseau.** Tout se fait sur le dictionnaire embarqué : le mode hors ligne reste intact.
- **Aucun gonflement du fichier** : on emprunte des données déjà présentes.

## 6.4 Validation

Test décisif, à la main, sur 5 manches : à la phase de vote, **sans lire le mot affiché**, essayer d'identifier la vraie définition. Avant comme après, le score doit rester proche du hasard. Si l'on gagne systématiquement, un leurre se trahit — par sa longueur, son registre ou sa tournure.

**Commit :** `feat: leurres empruntés au dictionnaire pour les adversaires IA`

---

# Hors périmètre

À ne pas traiter, même si cela semble adjacent :

- Ajout de mots, de personnages, d'avatars ou de modes de jeu.
- Portage iOS.
- Optimisation du tunnel de conversion Premium, changement de prix.
- Migration de l'entitlement Premium vers le serveur (aujourd'hui en localStorage, avec « Restaurer mes achats » comme filet — suffisant à ce stade).
- Refactor, découpage en modules, migration de framework.
