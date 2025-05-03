import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    // Fetch all users with role SHOP
    const { data: shops, error } = await supabase
      .from('User')
      .select('id, fullName, email, role')
      .eq('role', 'SHOP')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching shop users:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المتاجر' },
        { status: 500 }
      )
    }

    console.log('Fetched shops:', shops)

    if (!shops || shops.length === 0) {
      console.log('No shops found in the database')
      return NextResponse.json([])
    }

    // Format the response to match the expected structure
    const formattedShops = shops.map(shop => ({
      id: shop.id,
      fullName: shop.fullName || shop.email?.split('@')[0] || 'متجر',
      email: shop.email,
      role: shop.role
    }))

    console.log('Formatted shops:', formattedShops)

    return NextResponse.json(formattedShops)
  } catch (error) {
    console.error('Error in shop users route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 