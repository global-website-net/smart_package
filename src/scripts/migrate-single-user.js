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

async function migrateUser(email, password) {
  try {
    console.log(`Migrating user: ${email}`)

    // Check if user exists in database
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email)
      .single()

    if (dbError || !dbUser) {
      console.error('Error finding user in database:', dbError)
      return
    }

    console.log('Found user in database:', dbUser)

    // Check if user exists in Supabase Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = authUsers?.users?.find(u => u.email === email)

    if (existingAuthUser) {
      console.log('User already exists in Supabase Auth, updating...')
      
      // Update user metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        {
          user_metadata: {
            full_name: dbUser.fullName,
            role: dbUser.role,
            governorate: dbUser.governorate,
            town: dbUser.town,
            phone_prefix: dbUser.phonePrefix,
            phone_number: dbUser.phoneNumber
          }
        }
      )

      if (updateError) {
        console.error('Error updating user metadata:', updateError)
        return
      }

      // Update database user ID to match Supabase Auth ID
      const { error: updateDbError } = await supabaseAdmin
        .from('User')
        .update({
          id: existingAuthUser.id,
          password: null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', dbUser.id)

      if (updateDbError) {
        console.error('Error updating database user:', updateDbError)
        return
      }

      console.log('Successfully updated existing user')
    } else {
      console.log('Creating new user in Supabase Auth...')

      // Create user in Supabase Auth
      const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: dbUser.fullName,
          role: dbUser.role,
          governorate: dbUser.governorate,
          town: dbUser.town,
          phone_prefix: dbUser.phonePrefix,
          phone_number: dbUser.phoneNumber
        }
      })

      if (createAuthError || !authUser?.user) {
        console.error('Error creating auth user:', createAuthError)
        return
      }

      console.log('Created auth user:', authUser.user.id)

      // Update database user ID to match Supabase Auth ID
      const { error: updateDbError } = await supabaseAdmin
        .from('User')
        .update({
          id: authUser.user.id,
          password: null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', dbUser.id)

      if (updateDbError) {
        console.error('Error updating database user:', updateDbError)
        return
      }

      console.log('Successfully created and updated user')
    }

    // Verify the setup
    const { data: verifyUser, error: verifyError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email)
      .single()

    if (verifyError || !verifyUser) {
      console.error('Verification failed:', verifyError)
    } else {
      console.log('Verified user in database:', verifyUser)
    }

  } catch (error) {
    console.error('Error in migrateUser:', error)
  }
}

// Get email and password from command line arguments
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node migrate-single-user.js <email> <password>')
  process.exit(1)
}

migrateUser(email, password).catch(console.error) 