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
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
    }

    const { trackingNumber, status, shopId, currentLocation, userId } = await request.json()

    if (!trackingNumber || !status || !shopId || !currentLocation || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Create package in Supabase
    const { data: newPackage, error } = await supabase
      .from('Package')
      .insert([
        {
          trackingNumber,
          status,
          shop: shopId,
          currentLocation,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating package:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الشحنة' }, { status: 500 })
    }

    return NextResponse.json(newPackage)
  } catch (error) {
    console.error('Error in package creation:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الشحنة' },
      { status: 500 }
    )
  }
} 