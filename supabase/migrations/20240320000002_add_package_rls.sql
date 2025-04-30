-- Enable RLS on Package table
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own packages
CREATE POLICY "Users can view their own packages"
ON "Package"
FOR SELECT
TO authenticated
USING (
  auth.uid() = "userId" OR 
  auth.uid() = "shopId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

-- Create policy to allow users to create packages
CREATE POLICY "Users can create packages"
ON "Package"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = "userId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

-- Create policy to allow users to update their own packages
CREATE POLICY "Users can update their own packages"
ON "Package"
FOR UPDATE
TO authenticated
USING (
  auth.uid() = "userId" OR
  auth.uid() = "shopId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
);

-- Create policy to allow users to delete their own packages
CREATE POLICY "Users can delete their own packages"
ON "Package"
FOR DELETE
TO authenticated
USING (
  auth.uid() = "userId" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
  )
); 