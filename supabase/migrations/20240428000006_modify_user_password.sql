-- Make password column nullable since we're using Supabase Auth for passwords
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- Update existing rows to have NULL password since we're using Supabase Auth
UPDATE "User" SET "password" = NULL; 