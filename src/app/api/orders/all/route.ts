import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    // Fetch all orders with user information
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        userId: true,
        purchaseSite: true,
        purchaseLink: true,
        phoneNumber: true,
        notes: true,
        additionalInfo: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedOrders = orders.map(order => ({
      ...order,
      user: order.user || null
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Error in all-orders route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}