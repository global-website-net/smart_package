-- Drop existing package policies
DROP POLICY IF EXISTS "Users can view their own packages" ON "package";
DROP POLICY IF EXISTS "Users can create packages" ON "package";
DROP POLICY IF EXISTS "Users can update their own packages" ON "package";
DROP POLICY IF EXISTS "Users can delete their own packages" ON "package";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "package";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "package";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "package";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "package";

-- Create new policies for package table
CREATE POLICY "Users can view their own packages"
ON "package"
FOR SELECT
USING (
  auth.uid() = "userId" OR 
  auth.uid() = "shopId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

CREATE POLICY "Users can create packages"
ON "package"
FOR INSERT
WITH CHECK (
  auth.uid() = "userId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

CREATE POLICY "Users can update their own packages"
ON "package"
FOR UPDATE
USING (
  auth.uid() = "userId" OR
  auth.uid() = "shopId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

CREATE POLICY "Users can delete their own packages"
ON "package"
FOR DELETE
USING (
  auth.uid() = "userId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

-- Ensure RLS is enabled
ALTER TABLE "package" FORCE ROW LEVEL SECURITY; 