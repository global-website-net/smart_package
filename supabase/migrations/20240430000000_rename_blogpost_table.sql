-- Rename BlogPost table to blogPost
ALTER TABLE "BlogPost" RENAME TO "blogPost";

-- Update RLS policies to use the new table name
DROP POLICY IF EXISTS "Authors can view their own unpublished blog posts" ON "BlogPost";
DROP POLICY IF EXISTS "Authors can create blog posts" ON "BlogPost";
DROP POLICY IF EXISTS "Authors can update their own blog posts" ON "BlogPost";
DROP POLICY IF EXISTS "Authors can delete their own blog posts" ON "BlogPost";

-- Recreate policies with the new table name
CREATE POLICY "Authors can view their own unpublished blog posts"
  ON "blogPost"
  FOR SELECT
  USING (auth.uid() = "authorId");

CREATE POLICY "Authors can create blog posts"
  ON "blogPost"
  FOR INSERT
  WITH CHECK (auth.uid() = "authorId");

CREATE POLICY "Authors can update their own blog posts"
  ON "blogPost"
  FOR UPDATE
  USING (auth.uid() = "authorId");

CREATE POLICY "Authors can delete their own blog posts"
  ON "blogPost"
  FOR DELETE
  USING (auth.uid() = "authorId"); 