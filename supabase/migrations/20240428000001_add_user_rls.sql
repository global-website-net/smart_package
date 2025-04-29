-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Allow public access for user creation (signup)
CREATE POLICY "Allow public user creation"
ON "User"
FOR INSERT
WITH CHECK (true);

-- Users can view their own data
CREATE POLICY "Users can view their own data"
ON "User"
FOR SELECT
USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
ON "User"
FOR UPDATE
USING (auth.uid()::text = id::text);

-- Users can delete their own data
CREATE POLICY "Users can delete their own data"
ON "User"
FOR DELETE
USING (auth.uid()::text = id::text);

-- Allow the service role to bypass RLS
ALTER TABLE "User" FORCE ROW LEVEL SECURITY; 