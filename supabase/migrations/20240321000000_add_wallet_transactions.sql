-- Create enum for transaction type
CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT');

-- Create WalletTransaction table
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10,2) NOT NULL,
    type transaction_type NOT NULL,
    reason TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_transaction_user_id ON "WalletTransaction"("userId");

-- Enable Row Level Security
ALTER TABLE "WalletTransaction" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own transactions
CREATE POLICY "Users can view their own transactions"
    ON "WalletTransaction"
    FOR SELECT
    USING (auth.uid() = "userId");

-- Create policy to allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions"
    ON "WalletTransaction"
    FOR INSERT
    WITH CHECK (auth.uid() = "userId"); 