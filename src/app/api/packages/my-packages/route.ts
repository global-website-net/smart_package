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
}

interface FormattedPackage {
  id: string
  trackingNumber: string
  status: string
  currentLocation: string
  lastUpdated: string
  shopName: string
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
        tracking_number,
        current_location,
        updated_at,
        status:status_id (
          name
        ),
        shop:shop_id (
          fullName
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    // Transform the data to match the frontend interface
    const formattedPackages: FormattedPackage[] = (packages as SupabasePackage[])?.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      status: pkg.status?.[0]?.name || 'Unknown',
      currentLocation: pkg.current_location || 'غير معروف',
      lastUpdated: pkg.updated_at,
      shopName: pkg.shop?.[0]?.fullName || 'غير معروف'
    })) || []

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 