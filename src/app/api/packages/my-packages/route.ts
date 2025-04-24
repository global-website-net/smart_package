import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Package {
  id: string
  tracking_number: string
  status: string
  shopId: string
  created_at: string
  user_id: string
  current_location: string
  updated_at: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Fetch packages for the current user
    const { data: packages, error } = await supabase
      .from('Package')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب الشحنات' }, { status: 500 })
    }

    if (!packages) {
      return NextResponse.json({ packages: [] })
    }

    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      status: pkg.status,
      shopName: pkg.shopId,
      createdAt: pkg.created_at,
      currentLocation: pkg.current_location,
      updatedAt: pkg.updated_at
    }))

    return NextResponse.json({ packages: formattedPackages })
  } catch (error) {
    console.error('Error in packages API:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 