import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // First, ensure the qrCode column exists
    await supabase.from('Package').select('qrCode').limit(1)

    const body = await request.json()
    const { trackingNumber, status, shopId, userId } = body

    // Validate required fields
    if (!trackingNumber || !status || !shopId || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Generate QR code
    const qrCodeData = {
      trackingNumber,
      status,
      shopId,
      userId,
      timestamp: new Date().toISOString()
    }
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData))

    // Create package in database
    const { data: packageData, error: packageError } = await supabase
      .from('Package')
      .insert([
        {
          trackingNumber,
          status,
          shopId,
          userId,
          qrCode
        }
      ])
      .select()
      .single()

    if (packageError) {
      console.error('Error creating package:', packageError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الشحنة' },
        { status: 500 }
      )
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error in create package route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الشحنة' },
      { status: 500 }
    )
  }
} 