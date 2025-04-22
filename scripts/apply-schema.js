// This script applies the database schema directly using the PostgreSQL client
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'prisma', 'direct-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Start a client
    const client = await pool.connect();
    
    try {
      // Check if UserRole enum exists
      const enumCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_type 
          WHERE typname = 'userrole'
        );
      `);
      
      const enumExists = enumCheckResult.rows[0].exists;
      console.log('UserRole enum exists:', enumExists);
      
      // Check if User table exists and has role column
      const tableCheckResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'role';
      `);
      
      const roleColumnExists = tableCheckResult.rows.length > 0;
      console.log('Role column exists:', roleColumnExists);
      
      // If role column doesn't exist, we need to recreate the table
      if (!roleColumnExists) {
        console.log('Role column is missing. Recreating User table...');
        
        // Drop existing tables that depend on User
        await client.query('DROP TABLE IF EXISTS "BlogPost" CASCADE;');
        await client.query('DROP TABLE IF EXISTS "Package" CASCADE;');
        await client.query('DROP TABLE IF EXISTS "User" CASCADE;');
        
        // Drop and recreate UserRole enum
        await client.query('DROP TYPE IF EXISTS "UserRole" CASCADE;');
        await client.query('CREATE TYPE "UserRole" AS ENUM (\'REGULAR\', \'SHOP\', \'ADMIN\', \'OWNER\');');
        
        // Recreate User table with role column
        await client.query(`
          CREATE TABLE "User" (
            "id" TEXT NOT NULL,
            "fullName" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "governorate" TEXT NOT NULL,
            "town" TEXT NOT NULL,
            "phonePrefix" TEXT NOT NULL,
            "phoneNumber" TEXT NOT NULL,
            "role" "UserRole" NOT NULL DEFAULT 'REGULAR',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          );
        `);
        
        // Recreate Package table
        await client.query(`
          CREATE TABLE "Package" (
            "id" TEXT NOT NULL,
            "trackingNumber" TEXT NOT NULL,
            "description" TEXT,
            "status" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "shopId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
          );
        `);
        
        // Recreate BlogPost table
        await client.query(`
          CREATE TABLE "BlogPost" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "authorId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
          );
        `);
        
        // Create indexes
        await client.query('CREATE UNIQUE INDEX "User_email_key" ON "User"("email");');
        await client.query('CREATE UNIQUE INDEX "Package_trackingNumber_key" ON "Package"("trackingNumber");');
        
        // Add foreign keys
        await client.query('ALTER TABLE "Package" ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;');
        await client.query('ALTER TABLE "Package" ADD CONSTRAINT "Package_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;');
        await client.query('ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;');
        
        console.log('Schema applied successfully');
      } else {
        console.log('Role column already exists. No changes needed.');
      }
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

// Run the script
applySchema().catch(error => {
  console.error('Error applying schema:', error);
  process.exit(1);
}); 