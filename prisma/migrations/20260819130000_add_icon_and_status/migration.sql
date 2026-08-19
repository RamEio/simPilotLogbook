-- AlterTable: add icon to Squadron
ALTER TABLE "Squadron" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'shield';

-- AlterTable: add status to Pilot
ALTER TABLE "Pilot" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ALIVE';
