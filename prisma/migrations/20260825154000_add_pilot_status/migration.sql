-- Remap legacy status values from 20260819130000 (ALIVE / OUT_OF_COMBAT)
-- to the canonical product values (ACTIVE / OUT_OF_ACTION).
-- Do NOT ADD COLUMN "status" — it already exists from the earlier migration.
UPDATE "Pilot" SET "status" = 'ACTIVE' WHERE "status" = 'ALIVE';
UPDATE "Pilot" SET "status" = 'OUT_OF_ACTION' WHERE "status" = 'OUT_OF_COMBAT';
