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

    // Try both exact and case-insensitive matches
    const { data: exactMatch, error: exactError } = await supabase
      .from('User')
      .select('id, email, fullName, role')
      .eq('email', email)
      .single()

    const { data: ilikeMatch, error: ilikeError } = await supabase
      .from('User')
      .select('id, email, fullName, role')
      .ilike('email', email)
      .single()

    // Get all RLS policies
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'User')

    return NextResponse.json({
      exactMatch: {
        found: !!exactMatch,
        error: exactError?.message,
        data: exactMatch
      },
      ilikeMatch: {
        found: !!ilikeMatch,
        error: ilikeError?.message,
        data: ilikeMatch
      },
      policies: {
        error: policyError?.message,
        data: policies
      }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 