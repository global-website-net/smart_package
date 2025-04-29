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
    if (!session.user.role) {
      return NextResponse.json(
        { error: 'لم يتم العثور على صلاحيات المستخدم' },
        { status: 403 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    // First, fetch the packages
    const { data: packages, error: packagesError } = await supabase
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

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedPackages = (packages as RawPackageData[]).map(pkg => ({
      ...pkg,
      user: pkg.user[0],
      shop: pkg.shop[0],
      currentLocation: null
    }))

    return NextResponse.json(transformedPackages)
  } catch (error) {
    console.error('Error in packages/all route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 