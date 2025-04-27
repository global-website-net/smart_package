-- Add qrCode column to Package table
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "qrCode" TEXT; 