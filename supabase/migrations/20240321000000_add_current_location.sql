-- Add currentLocation column to Package table
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "currentLocation" VARCHAR(255);

-- Update existing records to have a default value
UPDATE "Package" SET "currentLocation" = 'Unknown' WHERE "currentLocation" IS NULL; 