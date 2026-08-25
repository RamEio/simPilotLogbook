# 🛩️ CURSOR BRIEFING — Flight Logbook Multi-Simulateurs
> Carnet de vol collaboratif pour simulateurs de vol (IL-2 GB, IL-2 Korea, DCS, Star Citizen, MSFS)

---

## 1. VISION PRODUIT

**Nom du projet :** Sim Pilot Logbook

**Objectif :** Application web légère permettant à un petit groupe de pilotes (< 50 personnes) de renseigner et consulter leurs vols sur plusieurs simulateurs. Pas de compétition sérieuse — ambiance **club de passionnés**, carnet de vol partagé, palmarès escadrille et pilote.

**Public cible :** Groupe fermé de joueurs, usage interne, pas d'inscription publique.

---

## 2. STACK TECHNIQUE

### Choix retenus (simple, léger, robuste)

| Couche | Techno choisie | Justification |
|--------|---------------|---------------|
| Framework | **Next.js 14 (App Router)** | Full-stack, API routes intégrées |
| Base de données | **SQLite via Prisma ORM** | Fichier unique, zéro config serveur, parfait pour < 50 users |
| UI Components | **shadcn/ui + Tailwind CSS** | Modulaire, dark-mode natif, très personnalisable |
| Icônes | **Lucide React** | Léger, cohérent |
| Formulaires | **React Hook Form + Zod** | Validation simple et robuste |
| Déploiement | **Apply.Build** | PaaS européen, deploy depuis GitHub (branche `deploiement-apply.build`) |

### Ce qu'on N'utilise PAS (volontairement)
- ❌ Authentification complexe (pas de NextAuth, pas d'OAuth, pas de JWT)
- ❌ Base de données distante (pas de PostgreSQL, pas de PlanetScale)
- ❌ ORM complexe — Prisma suffit largement
- ❌ Redux ou Zustand — React state + Server Actions suffisent

### Modèle de sécurité (déclaratif)
- L'utilisateur **sélectionne son pilote** dans une liste déroulante à chaque session
- Pas de mot de passe, pas de session persistante
- N'importe qui peut **modifier** une entrée existante (système de confiance)
- Optionnel futur : code PIN par pilote (4 chiffres) sans base auth complexe

---

## 3. SCHÉMA DE BASE DE DONNÉES (Prisma Schema)

```prisma
// schema.prisma

model Squadron {
  id        String   @id @default(cuid())
  name      String   @unique
  tag       String?  // ex: [SQ] ou [501st]
  createdAt DateTime @default(now())
  pilots    Pilot[]
  flights   Flight[]
}

model Pilot {
  id         String   @id @default(cuid())
  name       String
  callsign   String?
  squadronId String
  squadron   Squadron @relation(fields: [squadronId], references: [id])
  createdAt  DateTime @default(now())
  flights    Flight[]
}

model Aircraft {
  id      String  @id @default(cuid())
  name    String
  game    Game
  isCustom Boolean @default(false) // ajouté manuellement par user
  flights Flight[]

  @@unique([name, game])
}

model Flight {
  id          String      @id @default(cuid())
  date        DateTime    @default(now())
  pilotId     String
  pilot       Pilot       @relation(fields: [pilotId], references: [id])
  squadronId  String
  squadron    Squadron    @relation(fields: [squadronId], references: [id])
  aircraftId  String
  aircraft    Aircraft    @relation(fields: [aircraftId], references: [id])
  game        Game
  duration    Int         // en minutes
  missionType String?     // ex: CAP, CAS, Escort, Intercept, Transport...
  missionName String?     // nom libre de la mission
  outcome     Outcome
  notes       String?     // notes libres
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum Game {
  IL2_GB       // IL-2 Great Battles (WWII)
  IL2_KOREA    // IL-2 Korea
  DCS          // DCS World
  STAR_CITIZEN // Star Citizen
  MSFS         // Microsoft Flight Simulator
}

enum Outcome {
  SUCCESS         // Réussite totale
  PARTIAL_AIRCRAFT // Réussite partielle — avion détruit
  PARTIAL_PILOT    // Réussite partielle — pilote abattu
  FAILURE          // Échec — objectif non atteint
  TOTAL_FAILURE    // Échec total — objectif non atteint + avion détruit ou pilote abattu
}
```

---

## 4. PAGES & NAVIGATION

### Structure de l'app

```
/                    → Dashboard global (stats rapides, derniers vols)
/log                 → Formulaire — Enregistrer un vol
/flights             → Liste de tous les vols (filtrable par jeu, pilote, escadrille)
/flights/[id]        → Détail d'un vol (avec bouton Modifier / Supprimer)
/squadrons           → Liste des escadrilles
/squadrons/[id]      → Fiche escadrille (pilotes, stats, vols)
/squadrons/new       → Créer une escadrille
/pilots              → Liste des pilotes
/pilots/[id]         → Fiche pilote (stats, historique)
/pilots/new          → Créer un pilote
/leaderboard         → Classement pilotes & escadrilles
/admin/seed          → [DEV] Seeder les avions pré-remplis
```

Auth (futur PIN) : composant `AuthPinPanel` — UI Korea v3 prête, logique non branchée (mode club trust actuel).

### Page principale — Dashboard `/`
- Compteur total de vols / heures de vol
- 5 derniers vols enregistrés (avec badge couleur outcome)
- Répartition par simulateur (mini bar chart)
- Bouton CTA bien visible : **"Enregistrer un vol"**

### Page — Enregistrer un vol `/log`
Formulaire en une seule page, 7 champs :

1. **Escadrille** — Select (avec option "Créer une escadrille")
2. **Pilote** — Select filtré par escadrille sélectionnée (avec option "Créer un pilote")
3. **Simulateur** — 5 boutons radio stylisés (IL-2 GB / IL-2 Korea / DCS / Star Citizen / MSFS)
4. **Avion** — Select filtré par simulateur sélectionné (recherche type-ahead) + bouton "Avion manquant ?"
5. **Durée** — Input numérique (heures + minutes) ou slider
6. **Mission** — Nom libre + type (dropdown : CAP, CAS, Escorte, Interception, Transport, Bombardement, Patrouille, Autre)
7. **Résultat** — 5 choix visuels (cards cliquables avec icône + couleur)
   - ✅ Réussite totale (vert)
   - ⚠️ Réussite partielle — Avion détruit (orange)
   - ⚠️ Réussite partielle — Pilote abattu (orange)
   - ❌ Échec (rouge)
   - 💀 Échec total (rouge sombre)

---

## 5. DESIGN SYSTEM — "KOREA v3.0"

> Spec source : [`ASSETS/simpilot_designsystem.md`](./ASSETS/simpilot_designsystem.md)  
> Visuels : `ASSETS/design-system-sim-pilot-logbook.png` (dark), `ASSETS/design-system-light-mode.png` (light)

### Inspiration visuelle
- **Tactical HUD** : registre militaire aviation, overlines uppercase, accents crimson / amber
- **Dark-first** avec **Light mode** miroir (même structure, échelle de valeurs inversée)
- Palette **fermée** — pas de nouvelles couleurs hors tokens

### Modes
- Défaut : **dark** (`data-theme="dark"`)
- Toggle : icône soleil / lune en haut à droite du header (`ThemeToggle`)
- Persistance : `localStorage` clé `spl-theme` + script anti-FOUC dans `layout.tsx`

### Tokens CSS (`src/styles/globals.css`)

```css
/* Dark (extrait) */
--bg-deep: #0B0F19;
--bg-elevated: #111827;
--bg-card: #1E293B;
--red-600: #DC2626;       /* CTA only */
--amber-500: #F59E0B;     /* nav / kickers (dark) */
--status-success: #10B981;
--text-primary: #FFFFFF;
--border-default: #334155;

/* Light : voir [data-theme="light"] — bg-pure/canvas, textes slate, status contrastés */
```

### Typographie
- **Inter uniquement** (400 / 500 / 600 / 700) — plus d’Orbitron / JetBrains Mono
- Échelle : display 36 / h1 28 / h2 24 / h3 20 / body-lg 16 / body 14 / caption 12 / overline 11
- Overlines : UPPERCASE, letter-spacing 0.5px, muted ou amber
- Rouge `#DC2626` : actions CTA uniquement — jamais décoratif passif

### Composants
- Radius default **8px**, cards : border-subtle + shadow level-1 + padding 24px
- Primary button : crimson states (default / hover `#B91C1C` / active `#7F1D1D`)
- Secondary : outlined, borders theme-aware
- Inputs : focus **info blue**, error **status-error**
- Badges HUD : success / warning / error / info / neutral (opacity 15% dark / 10% light)
- Progress : hauteur 8px, fill `red-600`

### Grille
- Max width **1280px** (`max-w-content`), gutter 24px
- Marges : 64px desktop / 32px tablet / 16px mobile

### Surfaces couvertes par le DS
Toutes les pages et shells futurs utilisent les mêmes tokens :
- Dashboard, Log, Vols, Détail vol
- Escadrilles (+ fiche), Pilotes (+ **fiche pilote** `/pilots/[id]`)
- **Leaderboard** `/leaderboard`
- **Auth PIN** : composant `AuthPinPanel` (shell UI, pas de logique auth branchée)
- Toasts, dialogs, selectors, cards de vol

---

## 6. DONNÉES PRÉ-REMPLIES — AVIONS PAR SIMULATEUR

### Seed script (`prisma/seed.ts`)

Ces données doivent être insérées via `prisma db seed` au démarrage.

#### IL-2 Great Battles (sélection représentative)
```
Bf 109 F-4, Bf 109 G-2, Bf 109 G-4, Bf 109 G-6, Bf 109 G-14, Bf 109 K-4,
Fw 190 A-3, Fw 190 A-5, Fw 190 A-8, Fw 190 D-9, Me 262 A, Ju 87 D-3, Ju 88 A-4, He 111 H-6,
LaGG-3 ser.29, Yak-1 ser.69, Yak-7b ser.36, Yak-1b ser.127, La-5 ser.8, La-5FN ser.2,
Il-2 mod.1941, Il-2 mod.1942, Il-2 mod.1943, Pe-2 ser.87, Pe-2 ser.35,
I-16 type 24, MiG-3 ser.24, P-40E-1, P-39L-1, P-47D-28, P-51D-15, P-38J-25,
Spitfire Mk.VB, Spitfire Mk.IXe, Spitfire Mk.XIV, Tempest Mk.V ser.2,
Typhoon Mk.Ib, Mosquito F.B. Mk.VI, A-20B,
SPAD 13.C1, Sopwith Camel, Fokker Dr.I, Fokker D.VII, S.E.5a
```

#### IL-2 Korea (à enrichir selon sortie officielle)
```
F-86F Sabre, MiG-15bis, F-80C Shooting Star, Yak-9P, La-9, Il-10, F-51D Mustang, B-29 Superfortress
```

#### DCS World (sélection principale)
```
F/A-18C Hornet, F-16C Viper, A-10C Warthog, A-10C II, F-15C Eagle, F-15E Strike Eagle,
F-14A Tomcat, F-14B Tomcat, F-4E Phantom II, F-100D Super Sabre, AJS-37 Viggen,
MiG-21bis, MiG-19P, MiG-29A, Su-25, Su-25T, Su-27, Su-33,
AH-64D Apache, UH-1H Huey, Mi-8MTV2, Ka-50 Black Shark, OH-58D,
P-47D Thunderbolt, P-51D Mustang, Spitfire LF Mk IX, Bf 109 K-4, Fw 190 D-9,
Mosquito FB VI, F4U-1D Corsair, C-101, L-39, Yak-52,
C-130J, CH-47F Chinook
```

#### Star Citizen (ships flight-ready)
```
Aurora MR, Aurora LN, Mustang Alpha, Avenger Titan, Cutter,
Gladius, Arrow, Sabre, Sabre Raven, Hurricane, Hornet F7C, Hornet F7C-S Ghost,
Eclipse, Retaliator, Hammerhead, Polaris, Idris-P,
Prospector, MOLE, Vulture, Reclaimer, Caterpillar,
Carrack, 400i, 600i, Mercury Star Runner,
Constellation Andromeda, Constellation Aquila,
Zeus Mk II ES, Zeus Mk II MR, Crusader C1 Spirit
```

#### Microsoft Flight Simulator (appareils génériques)
```
Cessna 172, Cessna 208 Caravan, Beechcraft Bonanza G36, Piper PA-28, Diamond DA40,
Boeing 747-8, Boeing 787 Dreamliner, Airbus A320neo, Airbus A310,
Daher TBM 930, Pilatus PC-6, Eurofighter Typhoon (Top Gun Edition),
F/A-18 (Top Gun Edition), Spitfire Mk. IX, P-51D Mustang, Junkers Ju 52,
Shock Ultra (ULM), Volocopter 2X, Icon A5, Pipistrel Virus SW
```

> **Note :** Chaque avion a un champ `isCustom: false`. Quand un user ajoute un avion via le formulaire, `isCustom: true` — ces ajouts sont visibles par toute la communauté.

---

## 7. FONCTIONNALITÉS DÉTAILLÉES

### 7.1 Gestion des escadrilles
- Créer une escadrille (nom + tag optionnel ex: [501st])
- Voir la liste de tous ses pilotes
- Stats agrégées : total vols, total heures, taux de réussite
- [FUTUR] Logo d'escadrille (upload image)

### 7.2 Gestion des pilotes
- Créer un pilote (nom + callsign optionnel + escadrille)
- Un pilote appartient à UNE escadrille
- Changer d'escadrille possible (modification)
- [FUTUR] Avatar pilote

### 7.3 Enregistrement d'un vol
- Tous les champs requis sauf notes et nom de mission
- L'avion est filtré dynamiquement selon le simulateur sélectionné
- Recherche par frappe (type-ahead) dans la liste d'avions
- Si l'avion est manquant : modal simple avec champ texte → crée l'avion (isCustom: true)
- Durée : input heures + minutes séparés (ex: 1h 45min)
- Soumission → redirection vers la liste des vols avec toast de confirmation

### 7.4 Modification / Suppression
- Chaque vol a un bouton "Modifier" → même formulaire pré-rempli
- Bouton "Supprimer" → confirmation modal avant suppression
- Pas de restriction : n'importe qui peut modifier (système déclaratif)

### 7.5 Liste des vols
- Filtrages cumulatifs : par simulateur, par escadrille, par pilote, par résultat
- Tri : date (défaut décroissant), durée, simulateur
- Pagination : 20 vols par page
- Chaque ligne = card compacte avec outcome badge coloré

### 7.6 Leaderboard
- Classement pilotes : total heures, total vols, taux réussite
- Classement escadrilles : mêmes métriques
- Page `/leaderboard` + API `/api/stats/leaderboard`
- Filtres : période (all-time / 30j / année) et simulateur

### 7.7 Fiche pilote
- Page `/pilots/[id]` : stats (vols, heures, réussite) + derniers vols
- Liens depuis liste pilotes, fiche escadrille, leaderboard

### 7.8 Auth PIN (optionnel)
- Champ `Pilot.pin` (4 chiffres, jamais exposé en API — flag `hasPin`)
- Création pilote : PIN optionnel
- Sélection pilote sur log/édition : modal `AuthPinPanel` + `POST /api/pilots/verify-pin`
- Mode club trust inchangé si pas de PIN

---

## 8. API ROUTES (Next.js App Router)

```
POST   /api/flights          → Créer un vol
GET    /api/flights          → Lister les vols (avec filtres query params)
GET    /api/flights/[id]     → Détail d'un vol
PUT    /api/flights/[id]     → Modifier un vol
DELETE /api/flights/[id]     → Supprimer un vol

GET    /api/squadrons        → Lister les escadrilles
POST   /api/squadrons        → Créer une escadrille

GET    /api/pilots           → Lister les pilotes (filtre ?squadronId=)
POST   /api/pilots           → Créer un pilote

GET    /api/aircraft         → Lister les avions (filtre ?game=DCS)
POST   /api/aircraft         → Ajouter un avion manquant (isCustom: true)

GET    /api/stats/dashboard  → Agrégats pour le dashboard
GET    /api/stats/leaderboard→ Classements (period, game)
POST   /api/pilots/verify-pin→ Vérifier PIN pilote
```

---

## 9. STRUCTURE DE FICHIERS SUGGÉRÉE

```
sim-pilot-logbook/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                 # Seed avions pré-remplis
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Layout global + dark theme
│   │   ├── page.tsx             # Dashboard
│   │   ├── log/page.tsx         # Formulaire vol
│   │   ├── flights/
│   │   │   ├── page.tsx         # Liste vols
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Détail vol
│   │   │       └── edit/page.tsx
│   │   ├── squadrons/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pilots/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx     # Fiche pilote
│   │   ├── leaderboard/page.tsx  # Classements
│   │   └── api/
│   │       ├── flights/route.ts
│   │       ├── squadrons/route.ts
│   │       ├── pilots/route.ts
│   │       ├── pilots/verify-pin/route.ts
│   │       ├── aircraft/route.ts
│   │       └── stats/
│   │           ├── dashboard/route.ts
│   │           └── leaderboard/route.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (Korea tokens)
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── auth-pin-panel.tsx
│   │   ├── flight-form.tsx      # Création + édition vol
│   │   ├── flight-card.tsx
│   │   ├── outcome-badge.tsx
│   │   ├── game-selector.tsx
│   │   ├── aircraft-combobox.tsx
│   │   ├── duration-input.tsx
│   │   ├── outcome-selector.tsx
│   │   └── nav.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   └── styles/
│       └── globals.css          # CSS tokens Korea v3.0 (dark + light)
├── ASSETS/
│   ├── simpilot_designsystem.md
│   ├── design-system-sim-pilot-logbook.png
│   └── design-system-light-mode.png
├── .env
├── next.config.ts
├── tailwind.config.ts           # Tokens Korea
└── package.json
```

---

## 10. INSTRUCTIONS DE DÉMARRAGE POUR CURSOR

```bash
# 1. Init projet
npx create-next-app@latest sim-pilot-logbook --typescript --tailwind --app --src-dir

# 2. Installer les dépendances
cd sim-pilot-logbook
npx shadcn@latest init
npx shadcn@latest add button input select card badge dialog toast form
npm install @prisma/client prisma react-hook-form @hookform/resolvers zod lucide-react

# 3. Initialiser Prisma avec SQLite
npx prisma init --datasource-provider sqlite

# 4. Coller le schema.prisma ci-dessus, puis :
npx prisma migrate dev --name init
npx prisma db seed

# 5. Lancer
npm run dev
```

### Variables d'environnement `.env`
```
DATABASE_URL="file:./dev.db"
```

---

## 11. CONTRAINTES & RÈGLES CURSOR

- **Pas d'auth obligatoire** : aucun middleware, aucune session, aucun JWT (PIN optionnel futur via `AuthPinPanel`)
- **Déclaratif** : le pilote est sélectionné en début de formulaire, pas de compte
- **SQLite uniquement** : ne pas migrer vers PostgreSQL sans demande explicite
- **Tout en TypeScript strict** : pas de `any`, types Prisma générés utilisés partout
- **Server Actions ou API Routes** : choisir l'un et être cohérent (préférer API Routes pour clarté)
- **shadcn/ui uniquement** : pas d'autres librairies de composants (pas de MUI, pas de Chakra)
- **CSS tokens d'abord** : couleurs via variables Korea v3 (`globals.css`), pas de valeurs hardcodées
- **Design System Korea v3** : dark + light, CTA crimson, amber nav, Inter seul, radius 8px
- **Toute nouvelle page** (fiche, leaderboard, auth, admin) doit réutiliser les tokens / composants existants
- **Mobile-first** : responsive sur mobile
- **Pas de i18n** : application en français uniquement

---

## 12. PHASES DE DÉVELOPPEMENT / CHECKLIST

### Phase 1 — MVP
- [x] Setup projet + Prisma + seed avions
- [x] Layout global + Design System Korea v3.0 (tokens, Inter, nav)
- [x] Mode dark / light + toggle header
- [x] Création escadrille + pilote
- [x] Formulaire enregistrement vol (complet)
- [x] Liste des vols avec filtres basiques
- [x] Dashboard avec stats simples

### Phase 2 — Enrichissement
- [x] Page fiche escadrille avec stats
- [x] Page fiche pilote avec historique
- [x] Modification d'un vol (`/flights/[id]/edit`)
- [x] Suppression d'un vol
- [x] Ajout avion manquant (modal)
- [x] Export / import CSV des vols

### Phase 3 — Leaderboard & auth UI
- [x] Page classement pilotes
- [x] Page classement escadrilles
- [x] Filtres leaderboard par période et simulateur
- [x] Shell UI Auth PIN (`AuthPinPanel`) sous Korea v3
- [x] Brancher logique PIN optionnelle par pilote

### Phase Design System v3 (août 2026)
- [x] Remplacer Hangar Ops → Korea v3.0
- [x] Tokens dark + light dans `globals.css`
- [x] Tailwind + composants shadcn alignés
- [x] Progress bars crimson, badges HUD, typo Inter
- [x] Docs / briefing / README à jour

---

> **Note d'implémentation :** Prisma 5 + SQLite ne supporte pas les enums natifs. `Game` et `Outcome` sont stockés en `String` et validés côté TypeScript / Zod (`src/lib/constants.ts`).

*Briefing Sim Pilot Logbook — Design System Korea v3.0 (août 2026)*
*Stack : Next.js 14 + Prisma + SQLite + shadcn/ui + Tailwind CSS*
*Déploiement : Apply.Build*