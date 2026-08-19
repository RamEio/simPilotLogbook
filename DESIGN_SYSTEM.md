# Sim Pilot Logbook — Design System

> Référence design réutilisable pour l'ensemble du projet.
> Thème : **Aviation multi-sim, planchette de vol (kneeboard), militaire.**

---

## 1. Palette de couleurs

### Backgrounds

| Token | Variable | Hex | Usage |
|-------|----------|-----|-------|
| `bg-primary` | `--bg-primary` | `#c0c5cc` | Fond de page principal, gris métallique |
| `bg-secondary` | `--bg-secondary` | `#1e2a3a` | Header, zones sombres (bleu nuit) |
| `bg-card` | `--bg-card` | `#e8ebef` | Fond des cards et panels |
| `bg-elevated` | `--bg-elevated` | `#f0f2f5` | Éléments surélevés, inputs, hover zones |

### Accents

| Token | Variable | Hex | Usage |
|-------|----------|-----|-------|
| `accent-primary` | `--accent-primary` | `#2d5f8a` | Couleur principale (bleu acier), CTA primary, liens actifs, barres de progression |
| `accent-primary-hover` | `--accent-primary-hover` | `#245176` | Hover sur CTA primary |
| `accent-primary-text` | `--accent-primary-text` | `#1e4a6e` | Texte bleu haute-contraste sur fonds clairs (CTA secondary) |
| `accent-amber` | `--accent-amber` | `#b8860b` | Alertes, résultats partiels |
| `accent-red` | `--accent-red` | `#a8201a` | Erreurs, résultats échoués, CTA destructive |
| `accent-blue` | `--accent-blue` | `#2d5f8a` | Alias de accent-primary |

### Texte

| Token | Variable | Hex | Ratio sur bg-primary | Usage |
|-------|----------|-----|----------------------|-------|
| `ink-primary` | `--text-primary` | `#1a1e24` | ~10:1 | Texte principal |
| `ink-secondary` | `--text-secondary` | `#3d4550` | ~6:1 | Texte secondaire, labels |
| `ink-muted` | `--text-muted` | `#4d5560` | ~4.5:1 (WCAG AA) | Texte tertiaire, placeholders |

### Bordures

| Token | Variable | Hex | Usage |
|-------|----------|-----|-------|
| `line-subtle` | `--border-subtle` | `#a0a7b0` | Bordures par défaut (global `*`) |
| `line-muted` | `--border-muted` | `#8a929c` | Bordures accentuées, cards, inputs |
| `line-accent` | `--border-accent` | `#2d5f8a` | Bordures focus, sélection active |

### Outcomes (résultats de vol)

| Token | Variable | Hex | Usage |
|-------|----------|-----|-------|
| `outcome-success` | `--outcome-success` | `#2e7d32` | Succès |
| `outcome-partial` | `--outcome-partial` | `#b8860b` | Succès partiel |
| `outcome-failure` | `--outcome-failure` | `#a8201a` | Échec |
| `outcome-total-failure` | `--outcome-total-failure` | `#6b0000` | Échec total |

---

## 2. Typographie

| Rôle | Police | Weight | Classe Tailwind | Usage |
|------|--------|--------|-----------------|-------|
| **Display / Titres** | Barlow Condensed | 600 (Semi-Bold) | `font-display` | Titres, labels de nav, boutons, card titles. Toujours en `uppercase tracking-wider` |
| **Body** | Inter | 400, 500, 600 | `font-body` | Texte courant, descriptions, contenus longs |
| **Mono / Data** | JetBrains Mono | 400, 500 | `font-mono` | Valeurs numériques, codes, identifiants techniques |

### Règles typographiques

- Les titres display (`font-display`) sont **toujours uppercase** avec `tracking-wider` ou `tracking-[0.18em]`
- Les labels courts (nav, boutons, card titles) utilisent `font-display text-sm uppercase tracking-wider`
- Le texte courant utilise `font-body text-sm` ou `text-base`
- Les valeurs numériques (compteurs, heures) utilisent `font-mono text-3xl`
- Les breadcrumbs / contexte utilisent `font-mono text-xs uppercase tracking-[0.2em] text-ink-muted`

---

## 3. Composants

### Boutons (CTA)

Base commune : `rounded-sm font-display uppercase tracking-wider focus-visible:ring-2 ring-offset-2`

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary (default)** | Fond `accent-primary`, texte blanc, ombre `kneeboard` | Action principale ("Enregistrer un vol") |
| **Secondary** | Fond `white/50`, texte `accent-primary-text`, bordure 2px `accent-primary`. Hover → remplissage bleu | Action secondaire ("Exporter CSV") |
| **Outline** | Transparent, bordure 2px `line-muted`. Hover → bordure bleu | Actions tertiaires |
| **Ghost** | Transparent, texte `ink-secondary`. Hover → fond `bg-elevated` | Actions contextuelles, menu items |
| **Destructive** | Fond `accent-red`, texte blanc | Suppression, actions dangereuses |

Tailles : `sm` (h-8), `default` (h-10), `lg` (h-12), `icon` (h-10 w-10)

### Cards

Base : `rounded-sm border-2 border-line-muted bg-bg-card shadow-kneeboard`

| Variante | Classe additionnelle | Usage |
|----------|---------------------|-------|
| **Standard** | (base seule) | Contenu général, listes |
| **KPI / Accent** | `border-t-4 border-t-accent-primary` | Cards de métriques clés (vols, heures) |

- **CardTitle** : `font-display text-sm uppercase tracking-wider text-accent-primary`
- **CardContent** : `p-4 pt-0`

### Panels

Classe CSS : `.panel`
Style : `bg-card`, `border 2px solid border-muted`, `border-radius 2px`, `box-shadow subtile`

### Inputs / Selects / Textareas

Style commun : `rounded-md border border-line-muted bg-bg-elevated px-3 py-2 text-sm text-ink-primary`
Focus : `focus-visible:border-accent-primary` (anciennement green, aliasé)

---

## 4. Layout

### Header / Navigation

- **Background** : Image `Header-base.png` en `bg-cover bg-center`
- **Overlay** : `bg-bg-secondary/70 backdrop-blur-[2px]` (div absolue) pour garantir la lisibilité
- **Fallback** : `bg-bg-secondary` si l'image ne charge pas
- **Liens de nav** : `font-display text-sm uppercase tracking-wider text-white/70` → hover `text-white bg-white/10` → active `text-white bg-white/20`
- **Mobile** : Menu déroulant avec fond `bg-bg-secondary/95 backdrop-blur-md`
- **Position** : `sticky top-0 z-40`

### Grille de fond

Le body utilise une grille subtile (40px) en repeating-linear-gradient pour évoquer le papier quadrillé d'une planchette de vol. Opacité très faible (`0.03`) pour rester en arrière-plan.

### Container

`mx-auto max-w-6xl px-4 py-6` — centré, max 1152px, padding responsive.

---

## 5. Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-kneeboard` | `2px 3px 8px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.4)` | Cards, boutons primary — relief métallique + reflet intérieur |
| `shadow-glow` | `0 0 12px color-mix(accent-primary 35%, transparent)` | Hover d'éléments sélectionnés (game-selector) |

---

## 6. Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-sm` | 1px | Boutons, cards — coins quasi-droits, style kneeboard |
| `rounded` (default) | 2px | Éléments standard |
| `rounded-md` | 2px | Inputs, selects |
| `rounded-lg` | 3px | Maximum autorisé — pas de pill buttons |

**Règle** : jamais de `rounded-full` ou `rounded-xl`. L'identité visuelle est **angulaire**, inspirée des planchettes de vol militaires.

---

## 7. Animations

| Nom | Durée | Easing | Usage |
|-----|-------|--------|-------|
| `fade-in` | 200ms | ease-out | Entrée de page / sections |
| `transition-colors` | 200ms | default | Hover sur boutons, liens |

---

## 8. Accessibilité (WCAG 2.1 AA)

| Critère | Conformité | Détail |
|---------|------------|--------|
| Contraste texte primaire | 10:1 | `#1a1e24` sur `#c0c5cc` |
| Contraste texte secondaire | 6:1 | `#3d4550` sur `#c0c5cc` |
| Contraste texte muted | 4.5:1 | `#4d5560` sur `#c0c5cc` — seuil AA respecté |
| Contraste CTA primary | 7:1+ | Texte blanc sur `#2d5f8a` |
| Contraste CTA secondary | 5:1+ | `#1e4a6e` sur fond `white/50` (~`#e0e3e6`) |
| Zone tactile minimum | 40-48px | `h-10` (40px) par défaut, `h-12` (48px) pour lg |
| Focus visible | ring-2 offset-2 | Ring bleu acier avec offset pour visibilité sur fond gris |

---

## 9. Assets

| Fichier | Emplacement | Usage |
|---------|-------------|-------|
| `Header-base.png` | `/public/images/` | Background du header (sans titre) |
| `Header-base-w-title.png` | `/public/images/` | Version avec titre (usage optionnel) |

---

## 10. Conventions de nommage

- **Couleurs** : `bg-*`, `accent-*`, `ink-*`, `line-*`, `outcome-*`
- **Fonts** : `font-display`, `font-body`, `font-mono`
- **Ombres** : `shadow-kneeboard`, `shadow-glow`
- **CSS variables** : préfixées par catégorie (`--bg-*`, `--text-*`, `--border-*`, `--accent-*`, `--outcome-*`)
- **Alias legacy** : `accent-green` → alias vers `accent-primary` pour compatibilité (à migrer progressivement)
