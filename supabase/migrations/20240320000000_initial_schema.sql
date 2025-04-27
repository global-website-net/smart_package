-- Drop existing tables if they exist
DROP TABLE IF EXISTS "PackageHistory" CASCADE;
DROP TABLE IF EXISTS "Package" CASCADE;
DROP TABLE IF EXISTS "Status" CASCADE;
DROP TABLE IF EXISTS "Wallet" CASCADE;
DROP TABLE IF EXISTS "BlogPost" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "fullname" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'REGULAR',
  "governorate" TEXT,
  "town" TEXT,
  "phoneprefix" TEXT,
  "phonenumber" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Wallet table
CREATE TABLE "Wallet" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userid" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "balance" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create BlogPost table
CREATE TABLE "BlogPost" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "authorid" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Status table
CREATE TABLE "Status" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Package table
CREATE TABLE "Package" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trackingnumber" TEXT UNIQUE NOT NULL,
  "userid" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "statusid" UUID NOT NULL REFERENCES "Status"("id"),
  "recipientname" TEXT NOT NULL,
  "recipientphone" TEXT NOT NULL,
  "recipientaddress" TEXT NOT NULL,
  "weight" DECIMAL(10, 2) NOT NULL,
  "dimensions" TEXT,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create PackageHistory table
CREATE TABLE "PackageHistory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "packageid" UUID NOT NULL REFERENCES "Package"("id") ON DELETE CASCADE,
  "statusid" UUID NOT NULL REFERENCES "Status"("id"),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default statuses if they don't exist
INSERT INTO "Status" ("name", "description")
VALUES 
  ('Pending', 'Package is pending pickup'),
  ('In Transit', 'Package is in transit'),
  ('Delivered', 'Package has been delivered'),
  ('Cancelled', 'Package has been cancelled')
ON CONFLICT DO NOTHING;

-- Insert default admin user if it doesn't exist
INSERT INTO "User" ("email", "password", "fullname", "role")
VALUES (
  'admin@example.com',
  '$2b$10$W.BOZouaNaFTpgPk.2t3ruFDNlI1vtujvWRVnWjoyufnJA/SG11Fi', -- Password: admin123
  'Admin User',
  'ADMIN'
)
ON CONFLICT ("email") DO UPDATE
SET "password" = EXCLUDED."password",
    "fullname" = EXCLUDED."fullname",
    "role" = EXCLUDED."role";

-- Create wallet for admin user
INSERT INTO "Wallet" ("userid", "balance")
SELECT "id", 1000.00
FROM "User"
WHERE "email" = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- Insert sample blog post
INSERT INTO "BlogPost" ("title", "content", "authorid", "published")
SELECT 
  'Welcome to Package Smart',
  'Welcome to our new package tracking service. We are excited to provide you with a seamless experience for tracking your packages.',
  "id",
  true
FROM "User"
WHERE "email" = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_package_user_id" ON "Package"("userid");
CREATE INDEX IF NOT EXISTS "idx_package_status_id" ON "Package"("statusid");
CREATE INDEX IF NOT EXISTS "idx_package_history_package_id" ON "PackageHistory"("packageid");
CREATE INDEX IF NOT EXISTS "idx_wallet_user_id" ON "Wallet"("userid");
CREATE INDEX IF NOT EXISTS "idx_blog_author_id" ON "BlogPost"("authorid");

-- Enable Row Level Security (RLS) on Package table
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;

-- Create policies for Package table
CREATE POLICY "Users can view their own packages"
  ON "Package"
  FOR SELECT
  USING (auth.uid() = "userid");

CREATE POLICY "Users can create their own packages"
  ON "Package"
  FOR INSERT
  WITH CHECK (auth.uid() = "userid");

CREATE POLICY "Users can update their own packages"
  ON "Package"
  FOR UPDATE
  USING (auth.uid() = "userid");

CREATE POLICY "Users can delete their own packages"
  ON "Package"
  FOR DELETE
  USING (auth.uid() = "userid");

-- Enable Row Level Security (RLS) on Wallet table
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;

-- Create policies for Wallet table
CREATE POLICY "Users can view their own wallet"
  ON "Wallet"
  FOR SELECT
  USING (auth.uid() = "userid");

CREATE POLICY "Users can update their own wallet"
  ON "Wallet"
  FOR UPDATE
  USING (auth.uid() = "userid");

-- Enable Row Level Security (RLS) on BlogPost table
ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;

-- Create policies for BlogPost table
CREATE POLICY "Anyone can view published blog posts"
  ON "BlogPost"
  FOR SELECT
  USING ("published" = true);

CREATE POLICY "Authors can view their own unpublished blog posts"
  ON "BlogPost"
  FOR SELECT
  USING (auth.uid() = "authorid");

CREATE POLICY "Authors can create blog posts"
  ON "BlogPost"
  FOR INSERT
  WITH CHECK (auth.uid() = "authorid");

CREATE POLICY "Authors can update their own blog posts"
  ON "BlogPost"
  FOR UPDATE
  USING (auth.uid() = "authorid");

CREATE POLICY "Authors can delete their own blog posts"
  ON "BlogPost"
  FOR DELETE
  USING (auth.uid() = "authorid"); 