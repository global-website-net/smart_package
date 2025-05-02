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

async function runMigration(file) {
  try {
    console.log(`Running migration: ${file}`)
    const sql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', file), 'utf8')
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.from('_sqlquery').select('*').eq('query', statement.trim())
      
      if (error) {
        console.error(`Error running statement: ${statement.trim()}`)
        console.error('Error:', error)
        process.exit(1)
      }
    }
    
    console.log(`Successfully ran migration: ${file}`)
  } catch (error) {
    console.error(`Error running migration ${file}:`, error)
    process.exit(1)
  }
}

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
      await runMigration(file)
    }

    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

// Check if a specific migration file was provided
const args = process.argv.slice(2)
if (args.length > 0) {
  runMigration(args[0])
} else {
  runMigrations()
} 