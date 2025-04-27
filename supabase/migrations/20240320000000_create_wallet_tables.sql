-- Create Wallet table
CREATE TABLE IF NOT EXISTS public.Wallet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(userId)
);

-- Create WalletTransaction table
CREATE TABLE IF NOT EXISTS public.WalletTransaction (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    walletId UUID NOT NULL REFERENCES public.Wallet(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    reason TEXT NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.Wallet(userId);
CREATE INDEX IF NOT EXISTS idx_wallet_transaction_wallet_id ON public.WalletTransaction(walletId);

-- Set up Row Level Security (RLS)
ALTER TABLE public.Wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.WalletTransaction ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own wallet"
    ON public.Wallet FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can view their own wallet transactions"
    ON public.WalletTransaction FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.Wallet
        WHERE Wallet.id = WalletTransaction.walletId
        AND Wallet.userId = auth.uid()
    ));

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for Wallet table
CREATE TRIGGER update_wallet_updated_at
    BEFORE UPDATE ON public.Wallet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 