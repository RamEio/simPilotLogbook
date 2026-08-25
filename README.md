# Sim Pilot Logbook

Carnet de vol collaboratif pour un petit groupe de pilotes (IL-2 Great Battles, IL-2 Korea, DCS, Star Citizen, MSFS).

Usage interne, ambiance club — pas d'inscription publique, pas d'authentification. Chaque session, on choisit son pilote dans une liste.

## Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- shadcn/ui + Tailwind CSS
- Déploiement prévu : [Apply.Build](https://apply.build/)

## Démarrage local

```bash
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000). Nom du produit : **Sim Pilot Logbook**.

## Déploiement Apply.Build

Branche Git : `deploiement-apply.build`.

L'app est packagée en Docker (`Dockerfile`) pour Apply.Build, un PaaS européen qui déploie un conteneur depuis GitHub.

1. Pousse cette branche (déjà prévue pour le premier déploiement).
2. Connecte le repo [RamEio/simPilotLogbook](https://github.com/RamEio/simPilotLogbook) sur [apply.build](https://apply.build/).
3. Choisis la branche `deploiement-apply.build` si le dashboard le demande.
4. Ajoute la variable d'environnement `DATABASE_URL=file:/app/data/prod.db` si elle n'est pas déjà injectée par le Dockerfile.
5. L'app sera joignable sur un sous-domaine `{app}.apps.apply.build`.

SQLite vit dans le conteneur : un redéploiement peut réinitialiser les vols. Le seed des avions est idempotent.

## Spec produit & design

- Briefing : [`cursor_briefing_flight_logbook.md`](./cursor_briefing_flight_logbook.md)
- Design system Korea v3.0 : [`ASSETS/simpilot_designsystem.md`](./ASSETS/simpilot_designsystem.md)

L’UI est **dark-first** avec un **mode light** (icône en haut à droite). Tokens CSS dans `src/styles/globals.css`.