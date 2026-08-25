# Checklist Sim Pilot Logbook

> Suivi des travaux réalisés — Design System Korea v3.0 & évolutions produit  
> Dernière mise à jour : 25 août 2026

---

## Design system Korea v3.0

- [x] Remplacer Hangar Ops (vert radar, Orbitron, scanlines) par Korea v3.0
- [x] Tokens CSS dark + light dans `src/styles/globals.css`
- [x] Tailwind recâblé (`crimson`, `amber`, `status`, spacing, radius, shadows)
- [x] Typographie Inter uniquement (400–700)
- [x] CTA crimson `#DC2626` ; amber pour navigation / kickers
- [x] Composants shadcn restylés (Button, Input, Select, Card, Badge, Dialog, Label)
- [x] Spec source : `ASSETS/simpilot_designsystem.md`
- [x] Briefing + README mis à jour

## Thème dark / light

- [x] `ThemeProvider` + persistance `localStorage` (`spl-theme`)
- [x] Script anti-FOUC dans `layout.tsx`
- [x] Toggle soleil / lune en haut à droite du header
- [x] Header image dark / light (assets mis à jour au fil des itérations)

## Header & navigation

- [x] Bandeau image pleine largeur (aspect naturel)
- [x] Menu aligné en haut du bandeau (pas centré verticalement)
- [x] Header **non sticky** (le contenu ne passe plus dessous au scroll)
- [x] Titre « Sim Pilot Logbook » à gauche (sans sous-titre Korea Ops)
- [x] Fil d’Ariane cliquable sur toutes les pages (`Breadcrumbs`)
- [x] Headers synchronisés depuis `ASSETS/header_darkmode.png` et `ASSETS/header_lightmode.png`
- [x] Hero texte explicite : kicker « Multi-sim flight log » + titre + promesse sessions de vol
- [x] Scrim gauche pour lisibilité ; nav chrome séparée du branding hero

## Dashboard

- [x] Retrait du bouton « Exporter CSV » (reste sur `/flights`)
- [x] Répartition simulateurs basée sur le **temps** (pas le nombre de vols)
- [x] Section **Temps par avion** (top 12)
- [x] Cards collapsibles avec chevron (`CollapsibleCard`)
- [x] CTA principal « Enregistrer un vol »

## Vols

- [x] Liste filtrable + pagination
- [x] Export / import CSV
- [x] Détail vol + suppression
- [x] **Édition de vol** `/flights/[id]/edit` (`FlightForm` partagé)
- [x] Formulaire log `/log` refactorisé via `FlightForm`

## Pilotes

- [x] Liste + création
- [x] Fiche pilote `/pilots/[id]` (stats + historique)
- [x] Statuts : **Actif** / **Hors comb.**
- [x] Formulaire d’édition statut / nom / callsign / escadrille / PIN
- [x] API `PUT /api/pilots/[id]` (fix Prisma `squadron.connect`)
- [x] Migration `status` + client Prisma régénéré

## Escadrilles

- [x] Liste + création + fiche (stats, pilotes, derniers vols)
- [x] Liens vers fiches pilotes

## Leaderboard

- [x] Page `/leaderboard` (pilotes + escadrilles)
- [x] Filtres période (all-time / 30j / année) + simulateur
- [x] API `/api/stats/leaderboard`

## Auth PIN (club trust)

- [x] Champ `Pilot.pin` optionnel (jamais exposé — flag `hasPin`)
- [x] `AuthPinPanel` + `POST /api/pilots/verify-pin`
- [x] Vérification à la sélection pilote sur log / édition

## UI / UX polish (en cours)

- [x] Cards « Derniers vols » : ombre retirée / allégée, hover animé
- [x] Animations collapsibles + respect `prefers-reduced-motion`
- [x] Revue guidée par `ASSETS/cursor_ux_ui_product_reviewer_improved.md`

## Docs & ops

- [x] `cursor_briefing_flight_logbook.md` aligné Korea v3 + phases
- [x] `docs/Checklist simpilot log.md` (ce fichier)
- [x] Docker / Apply.Build (branche `deploiement-apply.build`)
- [x] Seed avions Prisma

## À faire / backlog

- [ ] Filtres avancés leaderboard (déjà période + sim — éventuellement top kills)
- [ ] Édition vol : confirmation visuelle plus forte post-save
- [ ] Accessibilité : audit WCAG focus order / contrastes light mode
- [ ] Déployer les changements DS + statut pilote sur Apply.Build
- [ ] Sync assets header en prod (`public/header-*.png`)

---

*Produit : Sim Pilot Logbook — club multi-simulateurs, mode déclaratif, SQLite + Next.js 14*
