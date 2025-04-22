// Vercel build script to ensure database tables are created
import { execSync } from 'child_process';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

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
console.log('Applying database schema...');
async function applySchema() {
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
try {
  await applySchema();
} catch (error) {
  console.error('Error applying database schema:', error);
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