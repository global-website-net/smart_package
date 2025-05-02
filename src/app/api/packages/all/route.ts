import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { supabase } from '@/lib/supabase'

interface PackageUser {
  fullName: string
  email: string
}

interface PackageShop {
  name: string
  address: string
}

interface RawSupabasePackage {
  id: string
  trackingNumber: string
  description: string
  status: string
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  } | null
  shop: {
    name: string
    address: string
  } | null
}

interface PackageData {
  id: string
  trackingNumber: string
  description: string
  status: string
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  user: PackageUser | null
  shop: PackageShop | null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول إلى هذه الصفحة' },
        { status: 403 }
      )
    }

    const { data: packages, error } = await supabase
      .from('package')
      .select(`
        id,
        trackingNumber,
        description,
        status,
        userId,
        shopId,
        createdAt,
        updatedAt,
        User:User (
          fullName,
          email
        ),
        Shop:Shop (
          fullName,
          address
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الطرود' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      description: pkg.description,
      status: pkg.status,
      userId: pkg.userId,
      shopId: pkg.shopId,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      user: pkg.User?.[0] ? {
        fullName: pkg.User[0].fullName || 'غير معروف',
        email: pkg.User[0].email || ''
      } : null,
      shop: pkg.Shop?.[0] ? {
        fullName: pkg.Shop[0].fullName || 'غير معروف',
        address: pkg.Shop[0].address || ''
      } : null
    }))

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطرود' },
      { status: 500 }
    )
  }
} 