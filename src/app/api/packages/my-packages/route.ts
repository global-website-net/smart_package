import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Package {
  id: string
  trackingNumber: string
  current_location: string
  updated_at: string
  status: string
  shop_name: string
  createdAt: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's packages using Supabase
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        id,
        trackingNumber,
        current_location,
        updated_at,
        status,
        shop_name,
        createdAt
      `)
      .eq('user_id', userId)
      .order('createdAt', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    if (!packages) {
      return NextResponse.json([])
    }

    // Format the packages data
    const formattedPackages = packages.map((pkg: Package) => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      status: pkg.status,
      currentLocation: pkg.current_location,
      lastUpdated: pkg.updated_at,
      shopName: pkg.shop_name,
      createdAt: pkg.createdAt
    }))

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 