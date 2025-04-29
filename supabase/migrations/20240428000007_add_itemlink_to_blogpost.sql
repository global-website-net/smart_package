-- Add itemLink column to BlogPost table
ALTER TABLE "BlogPost"
ADD COLUMN "itemlink" TEXT;

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN "BlogPost"."itemlink" IS 'Optional link to an item or resource related to the blog post'; 