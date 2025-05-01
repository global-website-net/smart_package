import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import prisma from '@/lib/prisma'

interface PackageData {
  id: string
  trackingNumber: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
  shop: {
    fullName: string
  }
  currentLocation?: string | null
}

interface RawPackageData {
  id: string
  trackingNumber: string
  status: string
  createdAt: string
  updatedAt: string
  user: Array<{
    fullName: string
    email: string
  }>
  shop: Array<{
    fullName: string
  }>
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
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

    // Fetch packages using Prisma
    const packages = await prisma.package.findMany({
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        shop: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    )
  }
} 