import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // First, fetch the packages
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        id,
        trackingNumber,
        status,
        shopId,
        currentLocation,
        createdAt,
        updatedAt,
        userId
      `)
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    // If there are packages, fetch the shop data separately
    if (packages && packages.length > 0) {
      // Get unique shop IDs
      const shopIds = [...new Set(packages.map(pkg => pkg.shopId).filter(Boolean))]
      
      // Fetch shop data if there are shop IDs
      let shops: Record<string, string> = {}
      if (shopIds.length > 0) {
        const { data: shopData, error: shopError } = await supabase
          .from('Shop')
          .select('id, name')
          .in('id', shopIds)
        
        if (!shopError && shopData) {
          // Create a map of shop ID to shop name
          shops = shopData.reduce((acc, shop) => {
            acc[shop.id] = shop.name
            return acc
          }, {} as Record<string, string>)
        }
      }

      // Combine package data with shop names
      const formattedPackages = packages.map(pkg => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        shop: pkg.shopId ? { name: shops[pkg.shopId] || 'متجر غير معروف' } : null,
        currentLocation: pkg.currentLocation,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        userId: pkg.userId
      }))

      return NextResponse.json(formattedPackages)
    }

    // If no packages found, return empty array
    return NextResponse.json([])
  } catch (error) {
    console.error('Error in my-packages route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 