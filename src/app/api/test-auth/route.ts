import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: Request) {
  try {
    // Get email from query parameter
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    console.log('Testing auth for email:', email)

    // Check auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)

    // Check database user
    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single()

    return NextResponse.json({
      auth: {
        exists: !!authUser,
        user: authUser ? {
          id: authUser.id,
          email: authUser.email,
          emailConfirmed: authUser.email_confirmed_at,
          lastSignIn: authUser.last_sign_in_at,
          metadata: authUser.user_metadata
        } : null,
        error: authError?.message
      },
      database: {
        exists: !!dbUser,
        user: dbUser,
        error: dbError?.message
      },
      ids_match: authUser && dbUser ? authUser.id === dbUser.id : false
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 