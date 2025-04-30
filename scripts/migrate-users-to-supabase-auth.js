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

async function migrateUsers() {
  try {
    // Get all users from the database
    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('User')
      .select('*')
      .not('password', 'is', null)

    if (dbError) {
      console.error('Error fetching users:', dbError)
      return
    }

    console.log(`Found ${dbUsers?.length || 0} users to migrate`)

    // For each user that still has a password in the database
    for (const user of dbUsers || []) {
      try {
        // Check if user already exists in Supabase Auth
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingAuthUser = authUsers?.users?.find(u => u.email === user.email)

        if (!existingAuthUser) {
          // Create user in Supabase Auth
          const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: 'TEMPORARY_PASSWORD_' + Math.random().toString(36).slice(2), // Generate random temporary password
            email_confirm: true,
            user_metadata: {
              full_name: user.fullName,
              role: user.role,
              governorate: user.governorate,
              town: user.town,
              phone_prefix: user.phonePrefix,
              phone_number: user.phoneNumber
            }
          })

          if (createAuthError) {
            console.error(`Error creating auth user for ${user.email}:`, createAuthError)
            continue
          }

          console.log(`Created Supabase Auth user for ${user.email}`)

          // Update the user's ID in the database to match Supabase Auth ID
          const { error: updateError } = await supabaseAdmin
            .from('User')
            .update({
              id: authUser?.user?.id,
              password: null,
              updatedAt: new Date().toISOString()
            })
            .eq('id', user.id)

          if (updateError) {
            console.error(`Error updating user ${user.email}:`, updateError)
            continue
          }

          console.log(`Updated database user ${user.email}`)
        } else {
          // User already exists in Supabase Auth, just update the database
          const { error: updateError } = await supabaseAdmin
            .from('User')
            .update({
              id: existingAuthUser.id,
              password: null,
              updatedAt: new Date().toISOString()
            })
            .eq('id', user.id)

          if (updateError) {
            console.error(`Error updating user ${user.email}:`, updateError)
            continue
          }

          console.log(`Updated existing user ${user.email}`)
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
      }
    }

    console.log('Migration completed')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateUsers().catch(console.error) 