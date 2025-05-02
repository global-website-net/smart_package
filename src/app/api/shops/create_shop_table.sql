-- Create the Shop table
CREATE TABLE IF NOT EXISTS "public"."shop" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE "public"."shop" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view shops
CREATE POLICY "Allow all authenticated users to view shops" 
  ON "public"."shop" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy to allow only admin and owner to insert shops
CREATE POLICY "Allow only admin and owner to insert shops" 
  ON "public"."shop" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."User" 
      WHERE "User"."id" = auth.uid() 
      AND ("User"."role" = 'ADMIN' OR "User"."role" = 'OWNER')
    )
  );

-- Create policy to allow only admin and owner to update shops
CREATE POLICY "Allow only admin and owner to update shops" 
  ON "public"."shop" 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM "public"."User" 
      WHERE "User"."id" = auth.uid() 
      AND ("User"."role" = 'ADMIN' OR "User"."role" = 'OWNER')
    )
  );

-- Create policy to allow only admin and owner to delete shops
CREATE POLICY "Allow only admin and owner to delete shops" 
  ON "public"."shop" 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM "public"."User" 
      WHERE "User"."id" = auth.uid() 
      AND ("User"."role" = 'ADMIN' OR "User"."role" = 'OWNER')
    )
  );

-- Insert some sample shops
INSERT INTO "public"."shop" ("name", "email") VALUES 
  ('متجر أمازون', 'amazon@example.com'),
  ('متجر نون', 'noon@example.com'),
  ('متجر جولي شيك', 'jollychic@example.com'),
  ('متجر نون السعودية', 'noon-sa@example.com'),
  ('متجر نون الإمارات', 'noon-ae@example.com')
ON CONFLICT DO NOTHING; 