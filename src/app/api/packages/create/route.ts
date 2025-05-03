import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
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

    // Check if user is ADMIN or OWNER
    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بإنشاء طرد' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, shopId, userId } = body

    // Validate required fields
    if (!status || !shopId || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Generate a unique tracking number
    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // Create the package
    const newPackage = await prisma.package.create({
      data: {
        trackingNumber,
        status,
        userId,
        shopId,
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