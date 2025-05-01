import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

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

    const { data: packages, error } = await supabase
      .from('Package')
      .select(`
        id,
        trackingNumber,
        status,
        createdAt,
        updatedAt,
        user:userId (
          fullName,
          email
        ),
        shop:shopId (
          fullName
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الطلبات' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      status: pkg.status,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      user: {
        fullName: pkg.user?.fullName || 'غير معروف',
        email: pkg.user?.email || ''
      },
      shop: {
        fullName: pkg.shop?.fullName || 'غير معروف'
      }
    }))

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    )
  }
} 