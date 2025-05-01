import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى هذه الصفحة' },
        { status: 403 }
      )
    }

    const packages = await prisma.package.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    )
  }
} 