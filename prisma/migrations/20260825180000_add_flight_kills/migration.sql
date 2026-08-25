-- AlterTable: optional kill counters per flight (default 0)
ALTER TABLE "Flight" ADD COLUMN "killsAir" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Flight" ADD COLUMN "killsNaval" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Flight" ADD COLUMN "killsGround" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Flight" ADD COLUMN "killsBuilding" INTEGER NOT NULL DEFAULT 0;
