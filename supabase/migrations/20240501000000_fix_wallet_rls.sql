-- Drop existing wallet policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON "wallet";
DROP POLICY IF EXISTS "Users can update their own wallet" ON "wallet";

-- Create new policies for wallet table
CREATE POLICY "Users can view their own wallet"
ON "wallet"
FOR SELECT
USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own wallet"
ON "wallet"
FOR INSERT
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own wallet"
ON "wallet"
FOR UPDATE
USING (auth.uid() = "userId");

-- Ensure RLS is enabled
ALTER TABLE "wallet" FORCE ROW LEVEL SECURITY; 