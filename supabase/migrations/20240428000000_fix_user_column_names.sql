-- Rename columns to match actual Supabase schema
ALTER TABLE "User" 
  RENAME COLUMN "fullname" TO "fullName";

ALTER TABLE "User" 
  RENAME COLUMN "phoneprefix" TO "phonePrefix";

ALTER TABLE "User" 
  RENAME COLUMN "phonenumber" TO "phoneNumber";

-- Update the created_at and updated_at columns to camelCase
ALTER TABLE "User" 
  RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "User" 
  RENAME COLUMN "updated_at" TO "updatedAt"; 