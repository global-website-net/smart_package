-- Add qrCode column to Package table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Package' 
        AND column_name = 'qrCode'
    ) THEN 
        ALTER TABLE "Package" ADD COLUMN "qrCode" TEXT;
    END IF;
END $$; 