import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import prisma from '@/lib/prisma'

interface PackageData {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullname: string;
    email: string;
  };
  currentLocation?: string | null;
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

    // Fetch the packages with user data
    const packages = await prisma.package.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    })

    // Transform the data to match the expected format
    const transformedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      status: pkg.status,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      user: pkg.user,
      currentLocation: null
    }))

    return NextResponse.json(transformedPackages)
  } catch (error) {
    console.error('Error in my-packages route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
}