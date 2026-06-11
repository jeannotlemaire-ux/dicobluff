---
name: Dicobluff
description: Jeu de bluff littéraire — inventer, tromper, révéler.
colors:
  bg-ink:        "#0E1A22"
  bg-deep:       "#121F28"
  bg-layer:      "#18282F"
  surface:       "#162430"
  surface-mid:   "#1C2E3A"
  surface-high:  "#243848"
  border-subtle: "rgba(242,236,216,0.08)"
  border-soft:   "rgba(242,236,216,0.15)"
  cream:         "#F5EDD8"
  gold-primary:  "#C8860A"
  gold-bright:   "#E5C170"
  gold-pale:     "#F0D690"
  coral:         "#D94F3F"
  coral-bright:  "#E8645A"
  teal:          "#2A9D8F"
  teal-bright:   "#3DB8A9"
  text-primary:  "#F5EDD8"
  text-secondary: "#C9BC9C"
  text-muted:    "#A0937A"
typography:
  display:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(1.8rem, 5vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "'Manrope', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Manrope', system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  sm:   "8px"
  base: "16px"
  lg:   "22px"
  xl:   "30px"
  pill: "100px"
spacing:
  "2xs": "2px"
  xs:    "4px"
  sm:    "8px"
  md:    "16px"
  lg:    "24px"
  xl:    "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.gold-primary}"
    textColor: "{colors.bg-ink}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.bg-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px 18px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.base}"
    padding: "14px 16px"
  input-focus:
    backgroundColor: "{colors.surface-mid}"
    textColor: "{colors.text-primary}"
---

# Design System : Dicobluff

## 1. Overview

**Creative North Star : "La Plume et le Masque"**

Dicobluff oppose deux symboles : la plume de l'écrivain, outil de vérité, et le masque du théâtre, instrument du mensonge. Le système visuel porte cette tension. Chaque surface est sombre et concentrée — une scène où la lumière tombe uniquement sur ce qui compte. L'or n'est jamais décoratif ; il signale une action, une révélation, un moment de jeu. Le fond marine profond n'est pas un fond : c'est une présence.

Ce n'est pas un jeu de quiz. C'est un salon littéraire clandestin. La typographie Cormorant Garamond donne aux mots rares leur dignité ; Manrope structure l'interface sans jamais prendre le dessus. La tension entre ces deux registres — éditorial et fonctionnel — est la signature du système.

L'ennemi de ce design : tout ce qui ressemble à une application mobile ordinaire. Pas de fond blanc, pas d'icônes colorées multiples, pas de gradients violets, pas de confettis, pas de mascotte. Le plaisir vient de la précision et de la rareté — pas de la surcharge.

**Key Characteristics:**
- Palette marine-or-coral-teal : quatre rôles, zéro décoration
- Deux familles typographiques sur un axe de contraste précis (serif display / sans-serif UI)
- Grain de film à 4% d'opacité pour briser le plat digital
- Animations uniquement en `transform` et `opacity` — jamais de propriétés de layout
- Easing expo-out exclusif (`cubic-bezier(0.16, 1, 0.3, 1)`) : fluidité sans rebond

## 2. Colors : La Palette Marine-Or

La palette repose sur un fond d'encre profonde et un unique accent or, utilisé en proportion minimale. Les trois couleurs sémantiques (coral, teal, or) ont chacune un rôle unique et ne se substituent jamais l'une à l'autre.

### Primary
- **Or Sourd** (`#C8860A` / `--gold`): Actions primaires, focus, accentuation. Jamais décoratif. Son opacité réduite (4–12%) s'utilise comme fond de badge ou tint de surface. Toujours en contraste suffisant sur marine.
- **Or Brillant** (`#E5C170` / `--gold2`): Variante hover et glow de l'or. Utilisé pour les barres de progression, les états actifs, les éléments en lumière.

### Secondary
- **Coral** (`#D94F3F` / `--coral`): Signal d'enjeu — boutons d'action destructrice ou compétitive, alertes de score, indicateurs négatifs. Ne pas utiliser pour la décoration.
- **Teal** (`#2A9D8F` / `--teal`): Signal de progression et de validation. Barres XP alternatives, états "correct", indicateurs positifs.

### Neutral
- **Crème** (`#F5EDD8` / `--cream`): Texte principal sur fond marine. Aussi utilisée pour le nom du joueur et les éléments d'identité.
- **Crème atténuée** (`#C9BC9C` / `--text2`): Corps de texte secondaire, labels, hints. Contraste AA sur marine.
- **Crème sourde** (`#A0937A` / `--text3`): Microcopy, annotations, placeholders. Contraste minimal acceptable.
- **Marine Fond** (`#0E1A22` / `--bg`): La surface de jeu. Toujours la couche la plus profonde.
- **Surfaces** (`#162430` → `#243848`): Trois niveaux d'élévation tonal, toujours en rampant vers le bleu-vert foncé.

### Named Rules
**La Règle de l'Or Rare.** L'or primaire occupe moins de 10% de toute surface donnée. Sa rareté est son signal. Un écran entièrement doré serait un écran sans signification.

**La Règle des Quatre Rôles.** Coral = enjeu. Teal = progression. Or = action primaire. Marine = espace. Chaque couleur a un rôle unique. Ne pas croiser les rôles par souci d'harmonie décorative.

## 3. Typography

**Display Font :** Cormorant Garamond (fallback : Georgia, serif)
**Body Font :** Manrope (fallback : system-ui, sans-serif)

**Character :** La pairing est délibérément contrastée. Cormorant est la voix des mots rares, des titres, des révélations — italic, expressif, avec descenders visibles. Manrope est la voix de l'interface : compact, moderne, sans ambiguïté. Les deux familles ne se mélangent jamais sur le même élément.

### Hierarchy
- **Display** (700, 2.4rem, lh 1.15, ls -0.01em) : Mots affichés pendant la partie (le mot à définir). Jamais en corps de texte.
- **Headline** (600–700, 1.35–1.8rem, lh 1.25) : Titres d'écran, noms de personnages, sections de résultats. Cormorant.
- **Title** (600, 1.1rem, lh 1.4) : Sous-titres UI, en-têtes de cards. Manrope.
- **Body** (400, 1rem, lh 1.55) : Corps des définitions, descriptions. Manrope. Ligne max 65ch.
- **Label** (700, 0.65rem, ls 0.08em, uppercase) : Tags, badges, microlabels de navigation. Manrope uniquement. Jamais en corps de phrase.

### Named Rules
**La Règle des Deux Voix.** Cormorant porte l'éditorial, Manrope porte l'UI. Une troisième famille est interdite. Un élément de navigation en Cormorant ou un mot de jeu en Manrope sont des erreurs.

**La Règle du Descender.** En italic display, tout mot contenant `y g j p q` nécessite un `line-height ≥ 1.1` et un `padding-bottom: 2px` pour ne pas couper les jambages.

## 4. Elevation

Le système utilise la stratification tonale — des surfaces de plus en plus claires à mesure qu'elles s'élèvent — complétée par des ombres dirigées (non ambiantes). Aucune ombre n'utilise du noir pur ; toutes sont teintées marine ou dorées.

### Shadow Vocabulary
- **`--shadow-sm`** (`0 1px 3px rgba(0,0,0,.18)`) : Micro-élévation, séparateurs de liste.
- **`--shadow-md`** (`0 4px 14px rgba(0,0,0,.22)`) : Cards actives, tooltips, menus flottants.
- **`--shadow-lg`** (`0 8px 28px rgba(0,0,0,.32)`) : Overlays, modales, éléments en premier plan.
- **`--shadow-gold`** (`0 4px 18px rgba(200,134,10,.28)`) : Uniquement sur le bouton primaire et les éléments en état "actif doré". Interdit comme décoration.
- **`--shadow-coral`** (`0 4px 18px rgba(217,79,63,.22)`) : Uniquement sur les boutons d'enjeu (`.btn-gold`).

### Named Rules
**La Règle de l'Ombre Teintée.** Toutes les ombres sont teintées selon leur contexte chromatique. Aucune `box-shadow` en noir pur (`rgba(0,0,0,X)` > 0.35 est interdit sauf `--shadow-lg`). Une ombre noire sur fond marine lit mal et rompt la cohérence.

## 5. Components

### Buttons
- **Shape :** Pill (border-radius 100px) pour tous les boutons principaux et secondaires. `border-radius: 12–16px` pour les boutons compacts (`.btn-sm`).
- **Primary :** Fond gradient or (`#C8860A → #E5A820`), texte `var(--ink-fixed)` (#0E1A22), padding `15px 32px`, `font-weight: 800`, lettrage `0.04em` uppercase Manrope. `box-shadow: --shadow-gold`. Hover : `filter: brightness(1.08)`.
- **Secondary (Coral) :** Fond gradient coral (`#9B3328 → #D94F3F → #E8645A`), texte blanc, `box-shadow: --shadow-coral`.
- **Ghost :** Fond transparent, `border: 1.5px solid var(--border2)`, texte `var(--text2)`. Hover : `background: var(--surface)`.
- **Ready (Teal) :** Fond gradient teal (`#1A5E4A → #2A8C72`), texte blanc.
- **Active/Press :** `scale(0.98)` ou `translateY(1px)` sur `:active` sur tous les variants.

### Cards / Containers
- **Corner Style :** `var(--radius-lg)` (22px) pour les cards principales, `var(--radius)` (16px) pour les composants internes.
- **Background :** `var(--surface)` (layer 1), `var(--surface2)` (layer 2) pour les cards emboîtées.
- **Border :** `1px solid var(--border)` (rgba crème 8%) au repos, `var(--border2)` (15%) sur les éléments en focus ou hover.
- **Internal Padding :** `var(--space-lg)` (24px) pour les cards contenu, `var(--space-md)` (16px) pour les composants compacts.

### Inputs / Fields
- **Style :** Fond `var(--surface)`, bordure `var(--border2)`, radius `var(--radius)` (16px).
- **Focus :** `border-color: var(--gold)` + `box-shadow: 0 0 0 3px rgba(160,106,0,.15)`. Pas de outline natif sur ces éléments.
- **Textarea :** `min-height: 120px`, `font-size: 1rem`, `line-height: 1.6`. Toujours en Manrope.
- **Light mode :** Fond `#FEFCF8` au repos, `#FFFFFF` en focus. Pas de tokens pour ces valeurs (mode clair hors-spec principal).

### Navigation (`.nav-side`)
- **Style :** Boutons `<button type="button">` pill (radius 20px), fond `var(--surface)`, `border: 1px solid var(--border2)`.
- **States :** `:active { transform: scale(.95) }`. Hover : `opacity: 0.8` sur icône et label.
- **Typography :** Label uppercase, `var(--text-2xs)` (0.65rem), `font-weight: 700`, `letter-spacing: 0.06em`.

### Quiz Option Card (`.quiz-opt`)
- **Style :** Boutons `display: block` pleine largeur, Cormorant Garamond (1rem), fond `var(--surface)`, bordure 1.5px `var(--border)`.
- **Hover/Active :** `background: var(--surface2)`, `border-color: var(--border2)`.
- **States correct/wrong :** `border-color: var(--teal2)` ou `var(--coral)` + glow `box-shadow` correspondant.

### Grain Overlay (`#grain`)
Composant système fixe. `position: fixed; inset: 0; z-index: 9001; opacity: 0.04; pointer-events: none`. SVG `feTurbulence fractalNoise` en data URI, tiled 200×200px. Masqué sous `prefers-reduced-transparency`. Couvre tout le cadre sans interférer avec aucune interaction.

## 6. Do's and Don'ts

### Do :
- **Do** utiliser `var(--ease-expo)` (`cubic-bezier(0.16, 1, 0.3, 1)`) pour toutes les transitions UI. C'est le seul easing autorisé hors cas `linear`.
- **Do** animer exclusivement `transform` et `opacity` pour les performances GPU. `transition: width` est interdit sauf pour les barres avec `box-shadow` actif qui causeraient un bleed.
- **Do** utiliser `var(--ink-fixed)` pour tout texte sur fond clair ou doré, `var(--cream-fixed)` pour tout texte sur fond sombre fixe (overlays, bannières). Ces tokens ne changent pas avec le thème.
- **Do** mettre `aria-label` sur tout bouton icon-only, `role="dialog" aria-modal="true"` sur tout overlay, `aria-expanded` sur tout trigger de menu.
- **Do** accéder au localStorage exclusivement via `LS.get(key, default)` / `LS.set(key, value)`.
- **Do** incrémenter `CACHE_VERSION` dans `sw.js` à chaque déploiement.

### Don't :
- **Don't** utiliser de fond crème, sable ou beige (`#faf7f2`, `#f5f1ea`, etc.). Ce design est marine par définition. Un fond clair est le light mode uniquement, pas la direction principale.
- **Don't** utiliser `background-clip: text` avec un gradient. Interdit absolument — décoration sans sens.
- **Don't** utiliser `border-left` ou `border-right` coloré > 1px comme accent sur une card ou un item de liste. C'est une bande latérale anti-pattern. Utiliser un fond teinté, une bordure complète, ou rien.
- **Don't** animer `width`, `height`, `top`, `left`, `margin`, ou `padding`. Ce sont des propriétés de layout — elles forcent un reflow. Exception documentée : `.quiz-progress-fill` et `.final-xp-bar-gain` conservent `transition: width` en raison du `box-shadow` glow qui sauterait avec `scaleX`.
- **Don't** utiliser des easings avec rebond (`cubic-bezier(.34,1.56,.64,1)` ou similaire). Le jeu est littéraire, pas jouet.
- **Don't** introduire une troisième famille de polices. Cormorant + Manrope est la limite. Un mono serait acceptable uniquement pour les codes de salon multijoueur.
- **Don't** utiliser l'or comme couleur de fond décoratif. Uniquement pour les actions primaires, les états de focus, et les indicateurs de progression.
- **Don't** utiliser des valeurs hex codées en dur dans le CSS statique quand un token équivalent existe. Les tokens `--ink-fixed`, `--cream-fixed`, `--bg2`, `--gold2`, etc. couvrent les cas fixes.
- **Don't** utiliser `transition: all` sur un composant. Toujours lister les propriétés explicitement pour éviter d'animer des propriétés de layout par inadvertance.
- **Don't** simuler Duolingo, une appli de quiz, ou un jeu mobile coloré. Référencer la DA : salon littéraire, plume, masque, parchemin, éditorial sombre. Pas de mascotte, pas de confettis, pas de score animé en arc-en-ciel.
