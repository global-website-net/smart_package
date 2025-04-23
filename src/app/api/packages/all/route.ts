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
    const { data: packages, error } = await supabase
      .from('Package')
      .select(`
        id,
        trackingNumber,
        current_location,
        updated_at,
        status,
        shop_name,
        createdAt,
        user_email
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب الشحنات' }, { status: 500 })
    }

    if (!packages) {
      return NextResponse.json({ packages: [] })
    }

    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      status: pkg.status,
      currentLocation: pkg.current_location,
      lastUpdated: pkg.updated_at,
      shopName: pkg.shop_name,
      createdAt: pkg.createdAt,
      userEmail: pkg.user_email
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