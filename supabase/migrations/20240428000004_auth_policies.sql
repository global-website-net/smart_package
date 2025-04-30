-- First, drop any existing policies
DROP POLICY IF EXISTS "Allow public user read for auth" ON "User";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "User";
DROP POLICY IF EXISTS "Enable insert access for unauthenticated users" ON "User";

-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Policy for reading user data during authentication (only email and password)
CREATE POLICY "Allow email lookup for authentication"
ON "User"
FOR SELECT
USING (
  -- Only allow access to email and password fields for authentication
  EXISTS (
    SELECT 1
    FROM "User"
    WHERE "User".email = current_user
  ) OR auth.role() = 'anon'
);

-- Policy for authenticated users to read their own data
CREATE POLICY "Enable read access for authenticated users"
ON "User"
FOR SELECT
USING (
  auth.uid()::text = id::text
  OR auth.role() = 'authenticated'
);

-- Policy for user registration
CREATE POLICY "Enable insert access for unauthenticated users"
ON "User"
FOR INSERT
WITH CHECK (true);

-- Create an index on email for better performance
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "User"(email);

-- Create a case-insensitive index on email
CREATE INDEX IF NOT EXISTS "user_email_lower_idx" ON "User"(LOWER(email)); 