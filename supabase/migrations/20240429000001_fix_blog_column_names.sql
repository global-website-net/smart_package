-- Rename columns to match camelCase convention
ALTER TABLE "BlogPost" 
  RENAME COLUMN "authorid" TO "authorId";

ALTER TABLE "BlogPost" 
  RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "BlogPost" 
  RENAME COLUMN "updated_at" TO "updatedAt";

ALTER TABLE "BlogPost" 
  RENAME COLUMN "itemlink" TO "itemLink"; 