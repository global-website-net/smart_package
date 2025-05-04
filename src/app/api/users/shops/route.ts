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
    // Fetch all users with SHOP role
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('id, fullName')
      .eq('role', 'SHOP')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching shop users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shops' },
        { status: 500 }
      )
    }

    console.log('Fetched shop users:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/users/shops:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 