import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 })
    }

    const { trackingNumber, orderNumber, userId, shopId, currentLocation, notes } = await request.json()

    // Validate required fields
    if (!trackingNumber || !orderNumber || !userId || !shopId) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب أن تكون مكتملة' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('package')
      .insert([
        {
          trackingNumber,
          orderNumber,
          userId,
          shopId,
          currentLocation,
          notes,
          status: 'PENDING_APPROVAL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Error creating package:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الطرد' }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/packages:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
} 