import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
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

    // Fetch all users with role SHOP
    const { data: shops, error } = await supabase
      .from('User')
      .select('id, fullName')
      .eq('role', 'SHOP')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching shops:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المتاجر' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedShops = shops.map(shop => ({
      id: shop.id,
      fullName: shop.fullName,
      role: 'SHOP'
    }))

    return NextResponse.json(transformedShops)
  } catch (error) {
    console.error('Error in shops route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 