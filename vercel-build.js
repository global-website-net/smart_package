// Vercel build script to ensure database tables are created
const { execSync } = require('child_process');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

// Step 1: Generate Prisma client
console.log('Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully');
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}

// Step 2: Apply database schema directly
console.log('Checking database schema...');
async function checkAndApplySchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('DATABASE_URL environment variable is not set. Skipping schema check.');
    return;
  }

  // Create a connection pool
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
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
      const roleColumnCheckResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'role';
      `);
      
      const roleColumnExists = roleColumnCheckResult.rows.length > 0;
      console.log('Role column exists:', roleColumnExists);
      
      // Check if tables exist
      const tableCheckResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('User', 'Package', 'BlogPost')
      `);
      
      const existingTables = tableCheckResult.rows.map(row => row.table_name);
      console.log('Existing tables:', existingTables);
      
      // If role column doesn't exist, we need to recreate the User table
      if (!roleColumnExists) {
        console.log('Role column is missing. Recreating User table...');
        
        // Start a transaction for schema changes
        await client.query('BEGIN');
        
        try {
          // Drop existing tables that depend on User
          if (existingTables.includes('BlogPost')) {
            await client.query('DROP TABLE IF EXISTS "BlogPost" CASCADE;');
          }
          if (existingTables.includes('Package')) {
            await client.query('DROP TABLE IF EXISTS "Package" CASCADE;');
          }
          if (existingTables.includes('User')) {
            await client.query('DROP TABLE IF EXISTS "User" CASCADE;');
          }
          
          // Create UserRole enum if it doesn't exist
          if (!enumExists) {
            console.log('Creating UserRole enum...');
            try {
              await client.query('CREATE TYPE "UserRole" AS ENUM (\'REGULAR\', \'SHOP\', \'ADMIN\', \'OWNER\');');
              console.log('UserRole enum created successfully');
            } catch (error) {
              if (error.code === '42710') { // duplicate_object error
                console.log('UserRole enum already exists, continuing...');
              } else {
                throw error;
              }
            }
          } else {
            console.log('UserRole enum already exists, skipping creation');
          }
          
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
          
          // Recreate Package table if it doesn't exist
          if (!existingTables.includes('Package')) {
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
          }
          
          // Recreate BlogPost table if it doesn't exist
          if (!existingTables.includes('BlogPost')) {
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
          }
          
          // Create indexes
          await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");');
          await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "Package_trackingNumber_key" ON "Package"("trackingNumber");');
          
          // Add foreign keys
          await client.query('ALTER TABLE "Package" ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;');
          await client.query('ALTER TABLE "Package" ADD CONSTRAINT "Package_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;');
          await client.query('ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;');
          
          // Commit the transaction
          await client.query('COMMIT');
          console.log('Schema applied successfully');
        } catch (error) {
          // Rollback the transaction on error
          await client.query('ROLLBACK');
          console.error('Error applying schema:', error);
          throw error;
        }
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

// Run the build process
async function build() {
  try {
    // Check and apply schema if needed
    await checkAndApplySchema();
    
    // Run Next.js build
    execSync('next build', { stdio: 'inherit' });
    
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 