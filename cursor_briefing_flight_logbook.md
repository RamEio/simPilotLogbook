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
| Framework | **Next.js 14 (App Router)** | Full-stack, API routes intégrées, déploiement Vercel gratuit |
| Base de données | **SQLite via Prisma ORM** | Fichier unique, zéro config serveur, parfait pour < 50 users |
| UI Components | **shadcn/ui + Tailwind CSS** | Modulaire, dark-mode natif, très personnalisable |
| Icônes | **Lucide React** | Léger, cohérent |
| Formulaires | **React Hook Form + Zod** | Validation simple et robuste |
| Déploiement | **Vercel** (gratuit) | CI/CD automatique depuis GitHub |

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
/pilots/new          → Créer un pilote
/leaderboard         → [FUTUR] Classement pilotes & escadrilles
/admin/seed          → [DEV] Seeder les avions pré-remplis
```

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

## 5. DESIGN SYSTEM — "HANGAR OPS"

### Inspiration visuelle
Références benchmark :
- **Esthétique cockpit 1990s** : CRT vert sur fond très sombre, scanlines subtiles
- **Mil-Spec HUD** : Typographie technique, grilles, indicateurs d'état sémantiques
- **Approche moderne** : Propre et lisible, pas "over-designed" — respecte MIL-STD-1472 (contraste, hiérarchie)

### Palette de couleurs

```css
/* Tokens CSS — Design System "Hangar Ops" */
:root {
  /* Fonds */
  --bg-primary:    #0A0C0F;   /* Noir hangar */
  --bg-secondary:  #111418;   /* Gris acier très sombre */
  --bg-card:       #161B22;   /* Carte / panel */
  --bg-elevated:   #1C2128;   /* Élément surélevé */

  /* Accents principaux */
  --accent-green:  #39D353;   /* Vert radar / succès */
  --accent-amber:  #E3A845;   /* Ambre cockpit / alerte */
  --accent-red:    #CF222E;   /* Rouge danger / échec */
  --accent-blue:   #58A6FF;   /* Bleu HUD / info */

  /* Textes */
  --text-primary:  #E6EDF3;   /* Blanc cassé */
  --text-secondary:#8B949E;   /* Gris moyen */
  --text-muted:    #484F58;   /* Gris sombre */

  /* Borders */
  --border-subtle: #21262D;
  --border-muted:  #30363D;
  --border-accent: #388BFD;

  /* Outcomes */
  --outcome-success:         #39D353;
  --outcome-partial:         #E3A845;
  --outcome-failure:         #CF222E;
  --outcome-total-failure:   #8B0000;
}
```

### Typographie

```css
/* Stack typographique */
--font-display: 'Orbitron', 'Rajdhani', sans-serif;  /* Titres, badges, callsigns */
--font-mono:    'JetBrains Mono', 'Courier New', monospace; /* Stats, chiffres, codes */
--font-body:    'Inter', 'DM Sans', sans-serif;       /* Corps de texte, labels */
```

> **Import Google Fonts :** Orbitron (700) + JetBrains Mono (400, 500) + Inter (400, 500, 600)

### Composants UI clés

#### Badge Outcome
```
[✅ SUCCÈS]     → bg vert transparent, border vert, texte vert
[⚠️ PARTIEL]   → bg ambre transparent, border ambre, texte ambre
[❌ ÉCHEC]      → bg rouge transparent, border rouge, texte rouge
[💀 ÉCHEC TOT.]→ bg rouge sombre, border rouge sombre, texte rouge pâle
```

#### Card de vol
```
┌─────────────────────────────────────────────────┐
│  [DCS]  F/A-18C Hornet          [SUCCÈS TOTAL] │
│  Cpt. MAVERICK · [501st]                        │
│  Mission : CAP Golfe — 1h 45min                │
│  08/18/2026                              [→]   │
└─────────────────────────────────────────────────┘
```

#### Bouton simulateur (radio stylisé)
- Fond sombre + border muted à l'état normal
- Border accent vert + glow subtil au hover / sélectionné
- Icône/logo du simulateur à gauche du label

### Effets visuels (subtils, non intrusifs)
- `backdrop-filter: blur(8px)` sur les modals et overlays
- Scanline texture très légère en CSS sur le header (`repeating-linear-gradient`)
- Border radius très faible (2–4px) — style anguleux et militaire
- Animations : fade-in uniquement, durée max 200ms

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

### 7.6 Leaderboard [FUTUR — structure à prévoir]
- Classement pilotes : total heures, total vols, taux réussite
- Classement escadrilles : mêmes métriques + top pilote de l'escadrille
- Filtrable par simulateur
- Période : all-time / 30 derniers jours / par année

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
GET    /api/stats/leaderboard→ [FUTUR] Classements
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
│   │   │   └── [id]/page.tsx    # Détail vol
│   │   ├── squadrons/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pilots/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── leaderboard/page.tsx # [FUTUR]
│   │   └── api/
│   │       ├── flights/route.ts
│   │       ├── squadrons/route.ts
│   │       ├── pilots/route.ts
│   │       ├── aircraft/route.ts
│   │       └── stats/dashboard/route.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── flight-card.tsx
│   │   ├── outcome-badge.tsx
│   │   ├── game-selector.tsx
│   │   ├── aircraft-combobox.tsx
│   │   ├── duration-input.tsx
│   │   ├── outcome-selector.tsx
│   │   └── nav.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Singleton Prisma Client
│   │   ├── utils.ts             # cn(), formatDuration()...
│   │   └── constants.ts        # GAMES, OUTCOMES, MISSION_TYPES
│   └── styles/
│       └── globals.css          # CSS tokens "Hangar Ops"
├── public/
│   └── fonts/                   # Orbitron, JetBrains Mono (si self-hosted)
├── .env                         # DATABASE_URL="file:./dev.db"
├── next.config.ts
├── tailwind.config.ts           # Custom colors depuis tokens
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

- **Pas d'auth** : aucun middleware de protection, aucune session, aucun JWT
- **Déclaratif** : le pilote est sélectionné en début de formulaire, pas de compte
- **SQLite uniquement** : ne pas migrer vers PostgreSQL sans demande explicite
- **Tout en TypeScript strict** : pas de `any`, types Prisma générés utilisés partout
- **Server Actions ou API Routes** : choisir l'un et être cohérent (préférer API Routes pour clarté)
- **shadcn/ui uniquement** : pas d'autres librairies de composants (pas de MUI, pas de Chakra)
- **CSS tokens d'abord** : toutes les couleurs via les variables CSS définies, pas de valeurs hardcodées
- **Mobile-first** : responsive sur mobile (les pilotes logguent depuis leur téléphone)
- **Pas de i18n** : application en français uniquement

---

## 12. PHASES DE DÉVELOPPEMENT RECOMMANDÉES

### Phase 1 — MVP (à développer maintenant)
- [x] Setup projet + Prisma + seed avions
- [x] Layout global + Design System "Hangar Ops" (couleurs, typo, nav)
- [x] Création escadrille + pilote
- [x] Formulaire enregistrement vol (complet)
- [x] Liste des vols avec filtres basiques
- [x] Dashboard avec stats simples

### Phase 2 — Enrichissement
- [x] Page fiche escadrille avec stats
- [ ] Page fiche pilote avec historique
- [ ] Modification d'un vol
- [x] Suppression d'un vol
- [x] Ajout avion manquant (modal)
- [ ] Export PDF ou CSV des vols

### Phase 3 — Leaderboard [FUTUR]
- [ ] Page classement pilotes
- [ ] Page classement escadrilles
- [ ] Filtres par période et simulateur
- [ ] Calcul taux réussite et "kills" (avions perdus adversaires — si donnée ajoutée)

---

> **Note d'implémentation :** Prisma 5 + SQLite ne supporte pas les enums natifs. `Game` et `Outcome` sont stockés en `String` et validés côté TypeScript / Zod (`src/lib/constants.ts`).

*Briefing rédigé pour Cursor — Projet Sim Pilot Logbook v1.0*
*Stack : Next.js 14 + Prisma + SQLite + shadcn/ui + Tailwind CSS*
