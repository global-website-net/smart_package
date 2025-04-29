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

async function createAdminUser() {
  try {
    // First, delete existing user if it exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === 'admin1@hotmail.com')
    
    if (existingUser) {
      console.log('Deleting existing user...')
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
    }

    // Delete from User table
    await supabaseAdmin
      .from('User')
      .delete()
      .eq('email', 'admin1@hotmail.com')

    // Create new user in Supabase Auth
    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin1@hotmail.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin1',
        role: 'ADMIN'
      }
    })

    if (createAuthError || !authUser?.user) {
      throw createAuthError || new Error('Failed to create auth user')
    }

    console.log('Created auth user:', authUser.user.id)

    // Create user in database
    const { error: dbError } = await supabaseAdmin
      .from('User')
      .insert({
        id: authUser.user.id,
        email: 'admin1@hotmail.com',
        fullName: 'Admin1',
        role: 'ADMIN',
        governorate: 'Default Governorate',
        town: 'Default Town',
        phonePrefix: '+962',
        phoneNumber: '7777777777',
        password: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error creating database user:', dbError)
      // Clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw dbError
    }

    console.log('Successfully created admin user')
    
    // Verify the setup
    const { data: verifyUser, error: verifyError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    if (verifyError || !verifyUser) {
      console.error('Verification failed:', verifyError)
    } else {
      console.log('Verified user in database:', verifyUser)
    }

  } catch (error) {
    console.error('Error in createAdminUser:', error)
  }
}

createAdminUser() 