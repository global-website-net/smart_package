import { createClient } from '@supabase/supabase-js'

// Function to verify Supabase configuration
export async function verifySupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('Supabase Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.log('Supabase Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required Supabase environment variables')
    return false
  }

  try {
    // Test connection with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabase.from('User').select('id').limit(1)
    
    if (error) {
      console.error('Error connecting to Supabase with anon key:', error)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase with anon key')
    
    // Test connection with service key if available
    if (supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const { data: adminData, error: adminError } = await supabaseAdmin.from('User').select('id').limit(1)
      
      if (adminError) {
        console.error('Error connecting to Supabase with service key:', adminError)
        return false
      }
      
      console.log('✅ Successfully connected to Supabase with service key')
    }
    
    return true
  } catch (error) {
    console.error('Error verifying Supabase configuration:', error)
    return false
  }
} 