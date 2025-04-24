import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    const { data: packages, error } = await supabase
      .from('Package')
      .select(`
        id,
        tracking_number,
        status,
        shop,
        current_location,
        created_at,
        user_id
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      status: pkg.status,
      shop: pkg.shop,
      currentLocation: pkg.current_location,
      createdAt: pkg.created_at,
      userId: pkg.user_id
    }))

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error in my-packages route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 