import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface SupabasePackage {
  id: string
  tracking_number: string
  current_location: string
  updated_at: string
  status: {
    name: string
  }[]
  shop: {
    fullName: string
  }[]
  user: {
    fullName: string
    email: string
  }[]
}

interface FormattedPackage {
  id: string
  trackingNumber: string
  status: string
  currentLocation: string
  lastUpdated: string
  shopName: string
  userName: string
  userEmail: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all packages using Supabase
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        id,
        tracking_number,
        current_location,
        updated_at,
        status:status_id (
          name
        ),
        shop:shop_id (
          fullName
        ),
        user:user_id (
          fullName,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    // Format the packages data
    const formattedPackages = packages.map((pkg: SupabasePackage) => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      status: pkg.status[0]?.name || 'UNKNOWN',
      currentLocation: pkg.current_location,
      lastUpdated: pkg.updated_at,
      shopName: pkg.shop[0]?.fullName || 'Unknown Shop',
      userName: pkg.user[0]?.fullName || 'Unknown User',
      userEmail: pkg.user[0]?.email || 'Unknown Email'
    }))

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 