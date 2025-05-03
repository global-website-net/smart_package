import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('User')
      .select('id, name, email')
      .eq('role', role)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 