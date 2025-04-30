const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables if .env file exists
try {
  require('dotenv').config()
} catch (error) {
  console.log('No .env file found, using default values')
}

// Use environment variables or default values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-service-role-key'

console.log('Using Supabase URL:', supabaseUrl)
console.log('Using Supabase Key:', supabaseKey.substring(0, 5) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  try {
    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log('Found migration files:', migrationFiles)

    // Execute each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      
      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        console.error(`Error running migration ${file}:`, error)
        process.exit(1)
      }
      
      console.log(`Successfully ran migration: ${file}`)
    }

    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

runMigrations() 