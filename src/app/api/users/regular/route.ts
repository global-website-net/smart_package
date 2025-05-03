import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    // Fetch all users with REGULAR role
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('id, email')
      .eq('role', 'REGULAR')
      .order('email', { ascending: true })

    if (error) {
      console.error('Error fetching regular users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch regular users' },
        { status: 500 }
      )
    }

    console.log('Fetched regular users:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/users/regular:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 