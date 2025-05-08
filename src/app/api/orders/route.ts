import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import { createClient } from '@supabase/supabase-js'

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
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize the query
    let query = supabaseAdmin
      .from('order')
      .select(`
        id,
        userId,
        purchaseSite,
        purchaseLink,
        phoneNumber,
        notes,
        additionalInfo,
        status,
        totalAmount,
        orderNumber,
        createdAt,
        updatedAt,
        User!Order_userId_fkey (
          id,
          fullName,
          email
        )
      `)
      .order('createdAt', { ascending: false })

    // If user is REGULAR, only show their orders
    if (session.user.role === 'REGULAR') {
      query = query.eq('userId', session.user.id)
    }
    // If user is not ADMIN or OWNER, return unauthorized
    else if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    console.log('Fetched orders:', orders)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error in GET /api/orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 