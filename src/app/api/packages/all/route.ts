import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Package {
  id: string
  tracking_number: string
  status: string
  shop_name: string
  created_at: string
  user_id: string
  current_location: string
  updated_at: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or owner
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all packages with user information
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        *,
        User:user_id (
          fullName,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }

    if (!packages) {
      return NextResponse.json({ packages: [] })
    }

    // Format the packages data
    const formattedPackages = packages.map((pkg: any) => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      status: pkg.status,
      shopName: pkg.shop_name,
      currentLocation: pkg.current_location,
      lastUpdated: pkg.updated_at,
      createdAt: pkg.created_at,
      userId: pkg.user_id,
      userName: pkg.User?.fullName || 'Unknown User',
      userEmail: pkg.User?.email || 'Unknown Email'
    }))

    return NextResponse.json({ packages: formattedPackages })
  } catch (error) {
    console.error('Error in packages API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
} 