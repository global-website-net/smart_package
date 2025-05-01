import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Fetch orders for the user using the session user ID
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        purchaseSite: true,
        purchaseLink: true,
        phoneNumber: true,
        notes: true,
        additionalInfo: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('Error in my-orders route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 