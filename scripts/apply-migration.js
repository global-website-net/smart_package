const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    // First, try to drop the not-null constraint
    const { error: constraintError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        DO $$ 
        BEGIN 
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'User'
                AND column_name = 'password'
                AND is_nullable = 'NO'
            ) THEN
                ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
            END IF;
        END $$;
      `
    })

    if (constraintError) {
      console.error('Error dropping not-null constraint:', constraintError)
      return
    }

    console.log('Successfully checked/dropped not-null constraint')

    // Then, update any non-null passwords to null
    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({ password: null })
      .not('password', 'is', null)

    if (updateError) {
      console.error('Error updating passwords to null:', updateError)
      return
    }

    console.log('Successfully updated passwords to null')

    // Verify the changes
    const { data: users, error: verifyError } = await supabaseAdmin
      .from('User')
      .select('email, password')

    if (verifyError) {
      console.error('Error verifying changes:', verifyError)
      return
    }

    console.log('Current user passwords:', users.map(u => ({ email: u.email, hasPassword: u.password !== null })))

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration().catch(console.error) 