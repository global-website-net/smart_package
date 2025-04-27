-- Add qrCode column to Package table
ALTER TABLE "Package" ADD COLUMN "qrCode" TEXT;

-- Enable Row Level Security
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON "Package"
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON "Package"
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON "Package"
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON "Package"
    FOR DELETE
    USING (auth.role() = 'authenticated'); 