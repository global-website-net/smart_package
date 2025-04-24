import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Fetch packages for the current user
    const { data: packages, error } = await supabase
      .from('Package')
      .select(`
        *,
        User:user_id (
          fullName,
          email
        ),
        Shop:shop_id (
          name
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب الشحنات' }, { status: 500 })
    }

    // Ensure we always return an array, even if empty
    const formattedPackages = (packages || []).map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      status: pkg.status,
      currentLocation: pkg.current_location,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      user: pkg.User,
      shop: pkg.Shop
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