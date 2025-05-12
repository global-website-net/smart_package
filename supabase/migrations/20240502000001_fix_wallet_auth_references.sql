-- First, backup existing data
CREATE TABLE IF NOT EXISTS wallet_backup AS SELECT * FROM wallet;

-- Drop existing wallet table
DROP TABLE IF EXISTS wallet CASCADE;

-- Recreate wallet table with correct references
CREATE TABLE public.wallet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Copy data back from backup (with correct column mapping)
INSERT INTO wallet (id, user_id, balance, created_at, updated_at)
SELECT 
    id, 
    "userId" as user_id, 
    balance, 
    "createdAt" as created_at, 
    "updatedAt" as updated_at
FROM wallet_backup;

-- Drop backup table
DROP TABLE wallet_backup;

-- Set up Row Level Security (RLS)
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own wallet"
    ON public.wallet FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public."User"
            WHERE id = wallet.user_id
        )
    );

CREATE POLICY "Users can update their own wallet"
    ON public.wallet FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public."User"
            WHERE id = wallet.user_id
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.wallet(user_id); 