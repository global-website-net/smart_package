import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session) // Debug log

    if (!session) {
      console.log('No session found') // Debug log
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    if (session.user.role !== 'SHOP') {
      console.log('User is not a shop:', session.user.role) // Debug log
      return NextResponse.json({ error: 'User is not a shop' }, { status: 401 })
    }

    const shopId = session.user.id
    console.log('Shop ID:', shopId) // Debug log

    // First, verify the shop exists
    const { data: shopData, error: shopError } = await supabase
      .from('users')
      .select('id')
      .eq('id', shopId)
      .single()

    if (shopError) {
      console.error('Error verifying shop:', shopError) // Debug log
      return NextResponse.json({ error: 'Shop verification failed' }, { status: 500 })
    }

    if (!shopData) {
      console.log('Shop not found:', shopId) // Debug log
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Then fetch packages
    const { data, error } = await supabase
      .from('package')
      .select(`
        id,
        trackingNumber,
        status,
        shopId,
        description,
        userId,
        createdAt,
        updatedAt,
        user:users!userId (
          id,
          fullName,
          email
        ),
        shop:users!shopId (
          id,
          fullName,
          email
        )
      `)
      .eq('shopId', shopId)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error) // Debug log
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Packages found:', data?.length) // Debug log
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in shop-packages route:', error) // Debug log
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 