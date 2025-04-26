-- Create the Shop table
CREATE TABLE IF NOT EXISTS "public"."Shop" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE "public"."Shop" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view shops
CREATE POLICY "Allow all authenticated users to view shops" 
  ON "public"."Shop" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy to allow only admin and owner to insert shops
CREATE POLICY "Allow only admin and owner to insert shops" 
  ON "public"."Shop" 
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
  ON "public"."Shop" 
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
  ON "public"."Shop" 
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
INSERT INTO "public"."Shop" ("name") VALUES 
  ('متجر أمازون'),
  ('متجر نون'),
  ('متجر جولي شيك'),
  ('متجر نون'),
  ('متجر نون'),
  ('متجر نون'),
  ('متجر نون'),
  ('متجر نون'),
  ('متجر نون'),
  ('متجر نون'); 