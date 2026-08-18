# Sim Pilot Logbook

Carnet de vol collaboratif pour un petit groupe de pilotes (IL-2 Great Battles, IL-2 Korea, DCS, Star Citizen, MSFS).

Usage interne, ambiance club — pas d'inscription publique, pas d'authentification. Chaque session, on choisit son pilote dans une liste.

## Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- shadcn/ui + Tailwind CSS
- Déploiement prévu : Vercel

## Démarrage local

```bash
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000). Nom du produit : **Sim Pilot Logbook**.

## Spec produit

La fiche de briefing à jour se trouve dans [`cursor_briefing_flight_logbook.md`](./cursor_briefing_flight_logbook.md).
