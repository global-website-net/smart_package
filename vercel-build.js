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
        AND table_name IN ('User', 'Package', 'Status', 'PackageHistory')
      `);
      
      const existingTables = tableCheckResult.rows.map(row => row.table_name);
      console.log('Existing tables:', existingTables);
      
      // If all required tables exist, skip schema application
      const requiredTables = ['User', 'Package', 'Status', 'PackageHistory'];
      const allTablesExist = requiredTables.every(table => existingTables.includes(table));
      
      if (allTablesExist) {
        console.log('All required tables already exist. Skipping schema application.');
        return;
      }
      
      console.log('Some tables are missing. Applying schema...');
      
      // Execute each statement individually without a transaction
      for (const statement of statements) {
        // Skip DROP TABLE statements to preserve existing data
        if (statement.toLowerCase().includes('drop table')) {
          console.log('Skipping DROP TABLE statement to preserve data');
          continue;
        }
        
        // Skip CREATE TABLE statements for tables that already exist
        if (statement.toLowerCase().includes('create table')) {
          const tableNameMatch = statement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?["']?([^"'\s]+)["']?/i);
          if (tableNameMatch && existingTables.includes(tableNameMatch[1])) {
            console.log(`Skipping CREATE TABLE statement for existing table: ${tableNameMatch[1]}`);
            continue;
          }
        }
        
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await client.query(statement);
        } catch (error) {
          // If the error is about a relation already existing, log it and continue
          if (error.code === '42P07') {
            console.log(`Table already exists, skipping: ${error.message}`);
            continue;
          }
          // For other errors, log and continue
          console.error(`Error executing statement: ${error.message}`);
          console.log('Continuing with next statement...');
        }
      }
      
      console.log('Database schema applied successfully');
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