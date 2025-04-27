import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
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

    const body = await request.json()
    const { trackingNumber, status, shopId, userId } = body

    // Validate required fields
    if (!trackingNumber || !status || !shopId || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Generate QR code for the package
    const qrCodeData = JSON.stringify({
      trackingNumber,
      status,
      shopId,
      userId,
      timestamp: new Date().toISOString()
    })
    
    let qrCode = ''
    try {
      qrCode = await QRCode.toDataURL(qrCodeData)
    } catch (qrError) {
      console.error('Error generating QR code:', qrError)
      // Continue without QR code if generation fails
    }

    // Create package in database with generated UUID
    const { data: packageData, error: packageError } = await supabase
      .from('Package')
      .insert([
        {
          id: uuidv4(),
          trackingNumber,
          status,
          shopId,
          userId,
          qrCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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