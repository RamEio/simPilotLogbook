# Checklist Sim Pilot Logbook

> Suivi des travaux réalisés — Design System Korea v3.0 & évolutions produit  
> Sources actives : `docs/simpilot_audit.pdf` (p.31–36) · `ASSETS/Designer.md` · parking produit  
> Dernière mise à jour : **28 août 2026**

---

## Comment lire cette checklist (priorisation)

**Une seule source de vérité pour « quoi faire ensuite »** : la section **Plan d’exécution (NOW / SOON / LATER)**.  
L’ancienne section « À faire / backlog » a été **absorbée** dedans (pas oubliée).

| Couche | À quoi ça sert | Comment savoir si c’est fait |
|--------|----------------|------------------------------|
| **Déjà livré** | Mémoire du produit avant/après Korea v3 | Cases `[x]` — historique, ne plus y chercher le prochain chantier |
| **Confrontation audit** | Carte audit × produit × avis Designer | Statuts ✅🟡⬜⏸ — diagnostic, pas l’ordre de travail |
| **NOW / SOON / LATER** | **Priorité d’exécution** | Cases `[ ]` → passer à `[x]` + ligne dans **Journal** quand livré |
| **Décisions produit** | Blocages wording / modèle (D-HERO, etc.) | Statut Ouvert / Tranché |
| **Journal / logs** | Chronologie : décisions, docs, livraisons | Une ligne par événement notable |
| **Parking** | Contexte des discussions | Historique narratif |

### Règle de priorisation (simple)

1. **NOW d’abord** — quick wins audit (FR, pluralisation, formulaires, nav, PIN, hero, WCAG). Fiabiliser ce qui existe.
2. **Puis SOON** — dont **toutes les anciennes tâches checklist** (filtres leaderboard, PilotCard, confirmation post-save, etc.).
3. **Puis LATER** — vision (auth multi-comptes, grades, collecteurs…).

**NOW ne remplace pas l’ancien backlog** : il le **précède**. Les filtres leaderboard / PilotCard n’ont pas disparu — ils sont en **SOON**, volontairement après le lot de fiabilisation.

### Mapping ancien backlog → horizon actuel

| Ancienne tâche (checklist pré-audit) | Où elle vit maintenant | Pourquoi pas dans NOW |
|--------------------------------------|------------------------|------------------------|
| Filtres leaderboard (escadrille + statut) | **SOON** — G1, G5 | Feature ; audit la met en SOON (après polish) |
| Passe UI `PilotCard` / `PilotRow` | **SOON** — G6 | Refonte composant, pas un quick win |
| Confirmation visuelle post-save édition vol | **SOON** | Polish UX ; après C1/C2 formulaires |
| Accessibilité / contraste light | **NOW** — E4 (+ reste éventuel SOON) | Audit : ratio impact/effort immédiat |
| *(nouveau)* Pluralisation, FR UI, astérisques, Retour, Accueil, PIN helper, hero CTA… | **NOW** | Issus de l’audit p.31–36, absents de l’ancien backlog |

### Au retour dans 2 semaines — checklist

1. Lire **Journal** (dernières lignes).
2. Regarder **NOW** : cases encore `[ ]` = à faire en premier.
3. Si NOW est tout `[x]` → passer à **SOON** (commencer par G1 filtre escadrille, souvent le plus demandé).
4. Vérifier **Décisions** (D-HERO, etc.) avant A2 / auth.

---

## Validation cohérence — `ASSETS/Designer.md` (28/08/2026)

Statut : **Validée avec réserves** (pas un tampon « parfait », une revue de cohérence globale).

### 1. Diagnostic rapide
La checklist est **cohérente** avec le rôle Designer (priorisation, tableaux, sources audit + heuristiques, fiabiliser avant d’étendre). Elle sert bien un profil **product / delivery**. Manques mineurs : critères de succès pas partout hors NOW ; D-HERO encore ouvert (signalé = conforme Designer « si incertain → signaler »).

### 2. Problèmes UX / doc identifiés

| # | Écart vs Designer.md | Gravité |
|---|----------------------|---------|
| V1 | Format Designer (diagnostic / problèmes / reco / justification) était implicite, pas en section dédiée | Corrigé ici |
| V2 | SOON : items listés sans « succès » aussi détaillés que NOW | Mineure — OK pour horizon 1–3 mois |
| V3 | E4 (WCAG) à cheval NOW/SOON : risque de flou | Mineure — traité en NOW, reste éventuel en SOON |
| V4 | Pas de lien explicite Korea DS ↔ chaque item NOW (ex. tokens pour états erreur) | Mineure — à rappeler en implémentation |

### 3. Recommandations concrètes (cohérence globale)

| Règle | Application |
|-------|-------------|
| R1 | Toute reco checklist doit rester reliée à une **source** (audit p.31+, NN/g, Material, HIG, biais, ou DS Korea) — déjà le cas en confrontation |
| R2 | À chaque livraison code : cocher NOW/SOON **et** 1 ligne Journal |
| R3 | Implémentation UI : respecter `ASSETS/simpilot_designsystem.md` (pas de nouveau look hors tokens) |
| R4 | Tranchez **D-HERO** avant A2 ; ne pas inventer le wording en silence |
| R5 | Ne pas tirer G1/G6 en avant de NOW sauf décision produit explicite (casserait la priorisation Designer/audit) |

### 4. Justification (critères Designer.md)

| Critère Designer.md | Checklist |
|---------------------|-----------|
| Sources projet + méthodes reconnues | ✅ audit PDF + confrontation + NN/g / Material / HIG / biais |
| Recommandations actionnables | ✅ NOW détaillé ; SOON/LATER phasés |
| Tableaux synthétiques | ✅ confrontation, mapping, effort |
| Priorisation impact / effort | ✅ NOW quick wins → SOON features → LATER vision (= feuille de route audit) |
| Signaler l’incertain | ✅ D-AUTH, D-SOLO, D-HERO ouverts |
| Éviter le théorique long | ✅ section « Comment lire » + horizons |

### 5. Verdict
**Oui — validée pour la cohérence globale** avec `ASSETS/Designer.md` : une seule file d’exécution, ancien backlog non perdu, audit intégré, décisions ouvertes visibles.  
**Réserves :** raffiner les critères de succès SOON au moment d’attaquer ce lot ; tenir R2–R5 pendant la delivery.

Voilà l'analyse IA de ton associé Design !

---

## Journal / logs

| Date | Entrée |
|------|--------|
| 25/08/2026 | Korea v3, statut pilote, kills/points, nav sticky, favicon LOG, fix Apply.Build |
| 28/08/2026 | Confrontation audit UX p.31+ × Designer.md × produit ; checklist réorganisée NOW/SOON/LATER |
| 28/08/2026 | **Lot NOW détaillé** intégré (problème / scope / succès / effort / hors-scope) |
| 28/08/2026 | Clarification priorisation : ancien backlog → SOON ; NOW = quick wins audit en premier ; section « Comment lire » ajoutée |
| 28/08/2026 | **Validation cohérence Designer.md** : checklist validée avec réserves (voir section dédiée) |
| 28/08/2026 | **Lot NOW livré** : E1–E4, C1, C6, B2, B3, H2, A2 (wording D-HERO provisoire) — build OK |

---

## Déjà livré (référence)

### Design system Korea v3.0
- [x] Hangar Ops → Korea v3.0 (tokens dark/light, Tailwind, Inter, CTA crimson)
- [x] Composants shadcn restylés ; spec `ASSETS/simpilot_designsystem.md`
- [x] ThemeProvider + FOUC + toggle ; headers dark/light

### Header & navigation
- [x] Nav **sticky** décorrélée de l’image hero
- [x] Fil d’Ariane ; hero kicker + titre + promesse
- [x] Favicon LOG bleu nuit

### Produit cœur
- [x] Dashboard (temps par sim / avion, cards collapsibles, CTA log)
- [x] Vols (liste, CSV, détail, édition, suppression + modale)
- [x] Pilotes (fiche, statut Actif/Hors comb., PIN)
- [x] Escadrilles (liste + fiche)
- [x] Leaderboard (période + simulateur + 6 classements : heures / points / 4 kills)
- [x] Scoring : Aérien 5 · Naval 4 · Sol 3 · Building 2 · 1 h = 1
- [x] Docker / Apply.Build (`deploiement-apply.build`)

---

## Confrontation audit (p.31+) × produit × Designer.md

Légende statut : ✅ fait · 🟡 partiel · ⬜ à faire · ⏸ décision produit requise  
Avis Designer : **Garder** / **Adapter** / **Reporter** / **Déjà couvert**

### 🎯 Proposition de valeur & Onboarding

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| A1 | Checklist onboarding 3 étapes (escadrille → pilote → vol) | ⬜ | **Garder** — SOON | NN/g H10 + biais Zeigarnik ; activation club |
| A2 | Clarifier proposition de valeur hero | 🟡 Hero existe (« Multi-sim flight log ») mais encore anglo + peu CTA | **Adapter** — NOW | Krug : clarifier en FR + CTA explicite, sans landing marketing lourde |
| A3 | Mode pilote solo (sans escadrille) | ⬜ Escadrille obligatoire | **Reporter** — LATER | NN/g H7 ok, mais casse le modèle club actuel ; décider avant code |

### 🏗 Architecture & Navigation

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| B1 | Header compact pages internes (80–100px) | ⬜ Hero plein partout | **Garder** — SOON critique | NN/g H1 + Fitts ; KPIs masqués = friction |
| B2 | Fusionner Accueil / Tableau de bord | 🟡 « Accueil » + lien « Tableau de bord » | **Garder** — NOW | NN/g H4 cohérence ; redondance cognitive |
| B3 | Boutons « Retour » contextuels | 🟡 Breadcrumbs présents, pas de Retour métier | **Adapter** — NOW | H3 contrôle ; breadcrumbs ≠ Retour explicite sur édition |

### 📝 Formulaires & Validation

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| C1 | Astérisques champs obligatoires | ⬜ Toast générique seulement | **Garder** — NOW critique | Material + NN/g H9 |
| C2 | Erreurs inline contextuelles | ⬜ Toasts Sonner | **Garder** — SOON | Form error state Material ; toast ≠ localisation erreur |
| C3 | Skeleton + présélection pilote édition | 🟡 Édition charge le vol ; skeleton absent | **Garder** — SOON | NN/g H1 ; prévention d’erreur |
| C4 | Formulaire log en 3 sections Qui/Quoi/Mission | ⬜ Formulaire plat | **Garder** — SOON | Gestalt proximité + Miller |
| C5 | Mémoriser dernières valeurs | ⬜ | **Garder** — SOON | NN/g H6 efficacité club |
| C6 | Helper sur bouton désactivé (création pilote) | ⬜ | **Garder** — NOW | NN/g H1 ; déjà noté audit p.29 |

### 📊 Data Visualization & KPIs

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| D1 | Tendances KPIs (Δ % vs période) | ⬜ | **Garder** — SOON | Biais de progression |
| D2 | Score temps réel dans le formulaire log | ⬜ Points calculés après coup | **Garder** — SOON | Gamification légère, aligne scoring déjà livré |
| D3 | Mini-leaderboard top 3 page escadrille | ⬜ | **Garder** — SOON | Compétition sociale Persona 3 |

### 🎨 Design System & Cohérence

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| E1 | Pluralisation (« 1 vol », « 2 vols ») | ⬜ Ex. « {n} vols » partout | **Garder** — NOW critique | UX Writing + effet Halo |
| E2 | Uniformiser FR (All-time, Ops, Log…) | 🟡 Beaucoup d’anglais UI | **Garder** — NOW | NN/g H2 ; audience FR club |
| E3 | Actions destructives distinctes | 🟡 Modale + bouton destructive OK sur vol ; pas d’icône poubelle systématique | **Adapter** — NOW | Apple HIG ; renforcer libellé + hiérarchie |
| E4 | Contraste WCAG light mode | 🟡 Scrim hero présent, audit non fait | **Garder** — NOW/SOON | WCAG 1.4.3 ; déjà backlog |

### 📱 Responsive & Mobile

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| F1 | Audit mobile 390px (tap 44px, tables, hamburger) | ⬜ Non formalisé | **Garder** — SOON | Apple HIG touch targets |
| F2 | Log mobile rapide 3 champs | ⬜ | **Adapter** — LATER | Utile post-mission ; après form sections desktop |

### ⚙ Fonctionnalités manquantes

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| G1 | Filtre escadrille leaderboard | ⬜ Période + sim seulement | **Garder** — SOON haute | Persona 3 ; déjà parking produit |
| G2 | CTAs contextuels fiche escadrille | ⬜ | **Garder** — SOON | Next best action |
| G3 | Zone drop CSV + feedback états | 🟡 Import file présent, UI basique | **Garder** — SOON | Material file upload + H1 |
| G4 | Grades / jalons (Aspirant → Major) | ⬜ Points existent | **Reporter** — LATER | Fort effort ; après fiabilité NOW/SOON |
| G5 | Filtre statut pilote leaderboard | ⬜ (parking produit, pas audit p.31) | **Garder** — SOON | Cohérent avec G1 |
| G6 | PilotCard / PilotRow unique | ⬜ (parking produit) | **Garder** — SOON | Cohérence visuelle DS |

### 🔐 Auth & comptes

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| H1 | Décision public vs multi-comptes | ⏸ Club trust + PIN ; pas de login | **Décider** — LATER (doc NOW) | Product clarity ; ne pas coder sans choix |
| H2 | Expliquer usage PIN | ⬜ Helper insuffisant | **Garder** — NOW | NN/g H10 |

### 🚀 Différenciation (vision)

| # | Item audit | Statut produit | Avis Designer.md | Pourquoi |
|---|------------|----------------|------------------|----------|
| I1 | Collecteur local DCS/IL-2 | ⬜ | **Reporter** — LATER | Fort effort / maintenance formats |
| I2 | Page escadrille publique partageable | ⬜ | **Reporter** — LATER | Après décision auth/public |
| I3 | Sauvegarde cloud premium | ⬜ CSV seulement | **Reporter** — LATER | Freemium ; hors MVP club |

---

## Plan d’exécution (horizons audit + parking)

### NOW — Fiabiliser (0–4 sem.) — détail opérationnel

Objectif : **fiabiliser la promesse actuelle**. Pas de nouvelle architecture — soin, clarté, cohérence FR.  
Ordre d’implémentation : **E1 → E2 → C1 → E3 → B2/B3 → H2 → A2 → E4** (+ **C6** en parallèle de C1).

#### Vue d’ensemble

| ID | Item | Effort | Décision bloquante ? | Statut |
|----|------|--------|----------------------|--------|
| E1 | Pluralisation | Faible | Non | [x] |
| E2 | Uniformiser FR UI | Faible | Non (nuances copy) | [x] |
| C1 | Astérisques obligatoires | Faible | Non | [x] |
| C6 | Helper bouton désactivé | Très faible | Non | [x] |
| E3 | Actions destructives | Faible | Non | [x] |
| B2 | Fusion Accueil / Tableau de bord | Très faible | Non | [x] |
| B3 | Boutons Retour contextuels | Faible | Non | [x] |
| H2 | Helper PIN | Très faible | Non | [x] |
| A2 | Hero FR + CTA | Faible | **D-HERO tranché provisoirement** | [x] |
| E4 | Contraste WCAG light | Faible–moyen | Non | [x] |

#### E1 — Pluralisation partout
- **Problème :** affichage `{n} vols` même pour 1 → « 1 vols ».
- **À faire :** utilitaire `formatCount(n, "vol")` → « 1 vol » / « 2 vols » ; idem pilote(s), escadrille(s), point(s), kill(s).
- **Où :** dashboard, listes pilotes/escadrilles, leaderboard, fiches.
- **Succès :** 0 occurrence de « 1 vols » (et équivalents).
- [x] Implémenté

#### E2 — Uniformiser la langue (FR)
- **Problème :** UI mixte FR/EN (`Ops /`, `All-time`, `Log`, `Edit Flight`, kickers anglais).
- **Dictionnaire cible** (hors noms propres IL-2, DCS, MSFS…) :

| Actuel | Cible |
|--------|--------|
| Ops / … | Opérations / … |
| All-time | Toutes périodes |
| Log / Edit Flight | Journal de vol / Modifier le vol |
| Multi-sim flight log | (lié à A2 / D-HERO) |
| Overline Leaderboard | Classements |

- **Succès :** 0 terme anglais « chrome » dans l’UI.
- [x] Implémenté

#### C1 — Champs obligatoires marqués
- **Problème :** requis invisibles jusqu’au toast « Complète les champs… ».
- **À faire :** `*` rouge sur labels + légende « * Champ obligatoire » en bas de `/log` et édition.
- **Champs :** escadrille, pilote, simulateur, avion, durée, résultat.
- **Succès :** formulaire lisible avant soumission.
- [x] Implémenté

#### C6 — Helper sur bouton désactivé
- **Problème :** création pilote — bouton « Créer » désactivé sans escadrille, sans explication.
- **À faire :** « Sélectionnez une escadrille pour créer un pilote. »
- **Succès :** blocage compréhensible sans chercher.
- [x] Implémenté

#### E3 — Actions destructives plus claires
- **Problème :** modale déjà présente ; libellé / hiérarchie perfectibles.
- **À faire :** « Supprimer ce vol » + icône poubelle ; rester `destructive` ; jamais au même niveau qu’une primaire ; renforcer modale « irréversible ».
- **Succès :** 0 ambiguïté primaire vs destroy.
- [x] Implémenté

#### B2 — Fusion Accueil / Tableau de bord
- **Problème :** « Accueil » + « Tableau de bord » → tous deux `/`.
- **À faire :** un seul lien nav « Tableau de bord » ; retirer le doublon Accueil.
- **Succès :** une seule entrée home.
- [x] Implémenté

#### B3 — Boutons « Retour » contextuels
- **Problème :** breadcrumbs OK, pas de Retour métier explicite.
- **À faire :** édition → « Retour au détail du vol » ; détail → « Retour à l’historique » (`/flights`) ; autres fiches si pertinent.
- **Succès :** navigation arrière sans bouton navigateur.
- [x] Implémenté

#### H2 — Expliquer le PIN pilote
- **Problème :** PIN existant, rôle flou.
- **À faire :** helper création + édition : « Ce code PIN protège les changements de statut. Laissez vide si inutile. »
- **Succès :** moins de confusion / PIN au hasard.
- [x] Implémenté

#### A2 — Clarifier proposition de valeur (hero)
- **Problème :** hero présent mais anglo + peu de CTA.
- **Livré (D-HERO provisoire) :** kicker « Carnet multi-simulateurs » ; promesse FR escadrilles ; CTA « Enregistrer un vol » → `/log`.
- **Succès :** un nouvel arrivant comprend le produit en ~3 secondes.
- [x] Implémenté *(wording ajustable)*

#### E4 — Contraste WCAG mode clair
- **Problème :** light mode dispo ; contraste non audité.
- **Livré :** scrim light renforcé + texte hero forcé blanc + ombre plus marquée. Audit axe DevTools encore recommandé en revue manuelle.
- **Succès :** contrastes AA textes principaux light.
- [x] Implémenté *(passe axe manuelle restante)*

#### Hors-scope NOW (renvoyé SOON / LATER)
Filtres leaderboard (G1/G5), header compact (B1), erreurs inline (C2), onboarding 3 étapes (A1), grades (G4), auth multi-comptes (H1), solo sans escadrille (A3), PilotCard (G6), mobile 390px (F1), log mobile rapide (F2).

### SOON — Différenciation légère (1–3 mois)

- [ ] **B1** Header compact sur pages internes (hero plein = accueil seulement)
- [ ] **C2** Erreurs inline formulaire log
- [ ] **C3** Skeleton loader édition + présélection fiable
- [ ] **C4** Formulaire log en 3 sections Qui / Quoi / Mission
- [ ] **C5** Mémoriser dernières valeurs (escadrille / pilote / sim)
- [ ] **G1** Filtre escadrille leaderboard
- [ ] **G5** Filtre statut pilote (Actif / tous)
- [ ] **A1** Checklist onboarding progressive dashboard
- [ ] **D2** Score estimé temps réel dans le log
- [ ] **D3** Mini-leaderboard top 3 fiche escadrille
- [ ] **G2** CTAs contextuels fiche escadrille
- [ ] **G3** Zone drop CSV + états feedback
- [ ] **D1** Tendances KPIs dashboard
- [ ] **G6** Composant `PilotCard` / `PilotRow` unique
- [ ] **F1** Audit mobile 390px + correctifs tap targets
- [ ] Confirmation visuelle post-save édition vol (parking produit)

### LATER — Étendre sans diluer (3–9 mois)

- [ ] **H1** Décision documentée : carnet public club vs multi-comptes (+ rôles)
- [ ] **A3** Mode pilote solo (si décision OK)
- [ ] **G4** Grades / jalons configurables
- [ ] **F2** Log mobile rapide 3 champs
- [ ] **I1** Collecteur local DCS/IL-2
- [ ] **I2** Escadrille publique partageable
- [ ] **I3** Sauvegarde cloud optionnelle

---

## Décisions produit à trancher (logs)

| ID | Question | Impact | Statut |
|----|----------|--------|--------|
| D-AUTH | Carnet club public (PIN) vs multi-comptes OAuth/email | H1, I2 | Ouvert |
| D-SOLO | Autoriser pilote sans escadrille ? | A3 | Ouvert — défaut actuel : non |
| D-HERO | Accroche FR exacte + CTA | A2 | **Tranché provisoire** — « Carnet multi-simulateurs » + CTA « Enregistrer un vol » (ajustable) |

---

## Parking produit (historique)

### 25/08/2026 — Kills / classements *(implémenté)*
- Kills par vol optionnels ; compteurs pilote = cumul
- 5+1 classements (heures, points, 4 kills)
- Règle points club

### 28/08/2026 — Audit UX intégré
- Source : `docs/simpilot_audit.pdf` § Checklist d’améliorations + feuille de route
- Confrontation : `ASSETS/Designer.md` (NN/g, Material, Apple HIG, biais cognitifs)
- Principe directeur repris de l’audit : **fiabiliser la promesse avant d’étendre** (carnet compréhensible > télémétrie)

### 28/08/2026 — Lot NOW documenté en détail
- Contenu opérationnel (problème / à faire / où / succès / effort) ajouté sous « Plan d’exécution → NOW »
- Hors-scope NOW listé explicitement
- Décision bloquante notée : **D-HERO** pour A2
- Log journal mis à jour (même date)

### Prochaine action recommandée
**Lot NOW terminé.** Enchaîner **SOON** — commencer par **G1** filtre escadrille leaderboard (+ G5 statut), puis C2/C3 formulaires ou G6 PilotCard selon priorité produit.

---

*Produit : Sim Pilot Logbook — club multi-simulateurs, mode déclaratif, SQLite + Next.js 14*

Voilà l'analyse IA de ton associé Design !
