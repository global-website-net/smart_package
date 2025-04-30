-- Create Shop table
CREATE TABLE IF NOT EXISTS public."Shop" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public."Shop" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view shops
CREATE POLICY "Allow all authenticated users to view shops" 
  ON public."Shop" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy to allow only admins and owners to insert shops
CREATE POLICY "Allow only admins and owners to insert shops" 
  ON public."Shop" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."User" 
      WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
  );

-- Create policy to allow only admins and owners to update shops
CREATE POLICY "Allow only admins and owners to update shops" 
  ON public."Shop" 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public."User" 
      WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
  );

-- Create policy to allow only admins and owners to delete shops
CREATE POLICY "Allow only admins and owners to delete shops" 
  ON public."Shop" 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public."User" 
      WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
  );

-- Insert some sample shops if needed
INSERT INTO public."Shop" (name) VALUES 
  ('متجر أمازون'),
  ('متجر نون'),
  ('متجر جولي شيك'),
  ('متجر نون السعودية'),
  ('متجر نون الإمارات')
ON CONFLICT DO NOTHING; 