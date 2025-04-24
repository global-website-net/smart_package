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
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if user is admin or owner
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error checking user role:', userError)
      return NextResponse.json({ error: 'حدث خطأ أثناء التحقق من الصلاحيات' }, { status: 500 })
    }

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Fetch all packages
    const { data: packages, error } = await supabase
      .from('Package')
      .select('*')
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
      shopName: pkg.shop,
      createdAt: pkg.createdAt,
      userEmail: pkg.user_email
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