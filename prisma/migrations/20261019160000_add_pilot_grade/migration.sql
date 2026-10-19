-- High-water grade. Progress toward the next grade is derived from flights.
ALTER TABLE "Pilot" ADD COLUMN "gradeKey" TEXT NOT NULL DEFAULT 'ASPIRANT';
ALTER TABLE "Pilot" ADD COLUMN "gradePausedAt" DATETIME;
ALTER TABLE "Pilot" ADD COLUMN "gradePauseMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Pilot" ADD COLUMN "gradeWindowFrom" DATETIME;
