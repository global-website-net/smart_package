-- Set default value for updatedAt column
ALTER TABLE "User" 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Update any existing rows that have null updatedAt
UPDATE "User"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL; 