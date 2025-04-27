-- Drop existing tables if they exist
DROP TABLE IF EXISTS "PackageHistory" CASCADE;
DROP TABLE IF EXISTS "Package" CASCADE;
DROP TABLE IF EXISTS "Status" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Status" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Package" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES "User"(id),
    status_id UUID REFERENCES "Status"(id),
    current_location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PackageHistory" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES "Package"(id),
    status_id UUID REFERENCES "Status"(id),
    location VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert or update default admin user
INSERT INTO "User" (email, password, fullName, role)
VALUES (
    'admin@example.com',
    '$2b$10$W.BOZouaNaFTpgPk.2t3ruFDNlI1vtujvWRVnWjoyufnJA/SG11Fi', -- This is a freshly generated bcrypt hash for 'admin123'
    'Admin User',
    'ADMIN'
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    fullName = EXCLUDED.fullName,
    role = EXCLUDED.role;

-- Insert default statuses if they don't exist
INSERT INTO "Status" (name, description)
VALUES 
    ('Pending', 'Package is pending processing'),
    ('Processing', 'Package is being processed'),
    ('In Transit', 'Package is in transit'),
    ('Delivered', 'Package has been delivered'),
    ('Cancelled', 'Package has been cancelled')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_package_tracking_number ON "Package"(tracking_number);
CREATE INDEX IF NOT EXISTS idx_package_user_id ON "Package"(user_id);
CREATE INDEX IF NOT EXISTS idx_package_history_package_id ON "PackageHistory"(package_id);
CREATE INDEX IF NOT EXISTS idx_package_history_timestamp ON "PackageHistory"(timestamp);

-- Enable Row Level Security
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;

-- Create policies for Package table
CREATE POLICY "Allow authenticated users to view their own packages"
ON "Package"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
);

CREATE POLICY "Allow authenticated users to create packages"
ON "Package"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
);

CREATE POLICY "Allow authenticated users to update their own packages"
ON "Package"
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
);

CREATE POLICY "Allow authenticated users to delete their own packages"
ON "Package"
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'OWNER')
    )
); 