import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم إنشاء الشحنات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { trackingNumber, status, shopId, currentLocation, userId } = body

    // Validate required fields
    if (!trackingNumber || !status || !shopId || !currentLocation || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    const { data: newPackage, error } = await supabase
      .from('Package')
      .insert({
        tracking_number: trackingNumber,
        status_id: (await supabase.from('Status').select('id').eq('name', status).single()).data?.id,
        user_id: userId,
        shop_id: shopId,
        current_location: currentLocation,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select(`
        *,
        user:user_id (
          fullName,
          email
        ),
        shop:shop_id (
          fullName
        )
      `)
      .single()

    if (error) {
      console.error('Error creating package:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الشحنة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...newPackage,
      user: newPackage.user,
      shop: newPackage.shop
    })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الشحنة' },
      { status: 500 }
    )
  }
} 