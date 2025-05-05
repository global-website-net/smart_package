-- Create Orders table
CREATE TABLE IF NOT EXISTS "order" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "purchaseSite" TEXT NOT NULL,
  "purchaseLink" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "notes" TEXT,
  "additionalInfo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_order_user_id" ON "order"("userId");
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "order"("status");

-- Enable Row Level Security (RLS)
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;

-- Create policies for Order table
CREATE POLICY "Users can view their own orders"
  ON "order"
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own orders"
  ON "order"
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own orders"
  ON "order"
  FOR UPDATE
  USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own orders"
  ON "order"
  FOR DELETE
  USING (auth.uid() = "userId");

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for Order table
CREATE TRIGGER update_order_updated_at
    BEFORE UPDATE ON "order"
    FOR EACH ROW
    EXECUTE FUNCTION update_order_updated_at(); 