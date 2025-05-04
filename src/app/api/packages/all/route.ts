import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { supabase } from '@/lib/supabase'

interface PackageUser {
  fullName: string
  email: string
}

interface PackageShop {
  fullName: string
  email: string
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
  orderNumber: string
  user: PackageUser | null
  shop: PackageShop | null
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
  orderNumber: string
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
        orderNumber,
        user:User!Package_userId_fkey (
          fullName,
          email
        ),
        shop:User!Package_shopId_fkey (
          fullName,
          email
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
    const formattedPackages = packages.map(pkg => {
      const user = Array.isArray(pkg.user) ? pkg.user[0] : pkg.user
      const shop = Array.isArray(pkg.shop) ? pkg.shop[0] : pkg.shop

      return {
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        description: pkg.description,
        status: pkg.status,
        userId: pkg.userId,
        shopId: pkg.shopId,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        orderNumber: pkg.orderNumber,
        user: user ? {
          fullName: user.fullName || 'غير معروف',
          email: user.email || ''
        } : null,
        shop: shop ? {
          fullName: shop.fullName || 'غير معروف',
          email: shop.email || ''
        } : null
      }
    }) as PackageData[]

    return NextResponse.json(formattedPackages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطرود' },
      { status: 500 }
    )
  }
} 