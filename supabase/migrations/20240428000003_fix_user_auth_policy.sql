-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public user read for auth" ON "User";

-- Create policy to allow reading user data for authentication
CREATE POLICY "Allow public user read for auth"
ON "User"
FOR SELECT
USING (true);

-- Ensure RLS is enabled
ALTER TABLE "User" FORCE ROW LEVEL SECURITY; 