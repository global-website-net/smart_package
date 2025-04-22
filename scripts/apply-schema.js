// This script applies the database schema directly
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a new pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applySchema() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../prisma/direct-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    console.log('Applying schema...');
    await client.query(sql);
    
    console.log('Schema applied successfully');
  } catch (error) {
    console.error('Error applying schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema(); 