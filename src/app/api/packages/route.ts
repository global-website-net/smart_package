import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is ADMIN/OWNER
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, shopId, description, userId } = body

    // Validate required fields
    if (!status || !shopId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate a unique tracking number
    const trackingNumber = `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Insert the new package
    const { data, error } = await supabaseAdmin
      .from('package')
      .insert([{
        trackingNumber,
        status,
        description,
        shopId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select(`
        *,
        user:userId (
          id,
          fullName,
          email
        ),
        shop:shopId (
          id,
          fullName,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating package:', error)
      return NextResponse.json(
        { error: 'Failed to create package' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize the query
    let query = supabaseAdmin
      .from('package')
      .select(`
        id,
        trackingNumber,
        status,
        description,
        userId,
        shopId,
        createdAt,
        updatedAt,
        user:User!Package_userId_fkey (
          id,
          fullName,
          email
        ),
        shop:User!Package_shopId_fkey (
          id,
          fullName,
          email
        )
      `)
      .order('createdAt', { ascending: false })

    // If user is REGULAR, only show their packages
    if (session.user.role === 'REGULAR') {
      query = query.eq('userId', session.user.id)
    }
    // If user is not ADMIN or OWNER, return unauthorized
    else if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: packages, error } = await query

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    console.log('Fetched packages:', packages)
    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error in GET /api/packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 