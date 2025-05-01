import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
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

    // Create the package
    const newPackage = await prisma.package.create({
      data: {
        trackingNumber,
        status,
        userId,
        shopId,
        qrCode,
      },
    })

    return NextResponse.json(newPackage)
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الطرد' },
      { status: 500 }
    )
  }
} 