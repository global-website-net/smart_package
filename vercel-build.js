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
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a connection pool
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'prisma', 'direct-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Start a client
    const client = await pool.connect();
    
    try {
      // Check if tables exist
      const tableCheckResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('User', 'Package', 'PackageStatus', 'PackageHistory')
      `);
      
      const existingTables = tableCheckResult.rows.map(row => row.table_name);
      console.log('Existing tables:', existingTables);
      
      // If all required tables exist, skip schema application
      const requiredTables = ['User', 'Package', 'PackageStatus', 'PackageHistory'];
      const allTablesExist = requiredTables.every(table => existingTables.includes(table));
      
      if (allTablesExist) {
        console.log('All required tables already exist. Skipping schema application.');
        return;
      }
      
      console.log('Some tables are missing. Applying schema...');
      
      // Execute each statement in a transaction
      await client.query('BEGIN');
      
      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await client.query(statement);
      }
      
      await client.query('COMMIT');
      console.log('Database schema applied successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

// Execute schema application
(async () => {
  try {
    await checkAndApplySchema();
  } catch (error) {
    console.error('Error checking/applying database schema:', error);
    process.exit(1);
  }

  // Step 3: Build Next.js application
  console.log('Building Next.js application...');
  try {
    execSync('next build', { stdio: 'inherit' });
    console.log('Next.js application built successfully');
  } catch (error) {
    console.error('Error building Next.js application:', error);
    process.exit(1);
  }

  console.log('Vercel build process completed successfully');
})(); 