import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

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
        id: uuidv4(),
        trackingNumber,
        status,
        userId,
        shopId,
        currentLocation,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select(`
        *,
        user:userId (
          fullName,
          email
        ),
        shop:shopId (
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