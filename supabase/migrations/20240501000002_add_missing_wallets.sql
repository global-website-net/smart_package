-- Add wallets for all existing users who don't have one
INSERT INTO "wallet" ("userId", "balance", "createdAt", "updatedAt")
SELECT 
  u.id as "userId",
  0 as "balance",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "User" u
LEFT JOIN "wallet" w ON u.id = w."userId"
WHERE w.id IS NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wallet" ON "wallet";
DROP POLICY IF EXISTS "Users can update their own wallet" ON "wallet";
DROP POLICY IF EXISTS "Admins can view all wallets" ON "wallet";
DROP POLICY IF EXISTS "Admins can update all wallets" ON "wallet";

-- Enable RLS on wallet table if not already enabled
ALTER TABLE "wallet" ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet table
CREATE POLICY "Users can view their own wallet"
  ON "wallet"
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can update their own wallet"
  ON "wallet"
  FOR UPDATE
  USING (auth.uid() = "userId");

CREATE POLICY "Admins can view all wallets"
  ON "wallet"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role IN ('ADMIN', 'OWNER')
    )
  );

CREATE POLICY "Admins can update all wallets"
  ON "wallet"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role IN ('ADMIN', 'OWNER')
    )
  ); 