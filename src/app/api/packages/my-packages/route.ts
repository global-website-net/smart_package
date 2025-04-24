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
    const { data: packages, error } = await supabase
      .from('Package')
      .select(`
        id,
        trackingNumber,
        status,
        shop,
        createdAt,
        user_email
      `)
      .eq('user_email', session.user.email)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب الشحنات' }, { status: 500 })
    }

    if (!packages || packages.length === 0) {
      return NextResponse.json({ packages: [] })
    }

    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      status: pkg.status,
      shopName: pkg.shop,
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