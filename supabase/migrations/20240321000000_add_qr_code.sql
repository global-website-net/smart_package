-- Add qrCode column to Package table
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "qrCode" TEXT;

-- Update existing packages to have a default QR code
UPDATE "Package" SET "qrCode" = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' WHERE "qrCode" IS NULL; 