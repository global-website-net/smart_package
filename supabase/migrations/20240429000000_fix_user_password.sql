-- Drop the not-null constraint if it exists
DO $$ 
BEGIN 
    -- Check if the password column has a not-null constraint
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'password'
        AND is_nullable = 'NO'
    ) THEN
        -- Drop the not-null constraint
        ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
    END IF;
END $$;

-- Update any non-null passwords to null
UPDATE "User" SET "password" = NULL WHERE "password" IS NOT NULL; 