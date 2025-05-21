import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Shop Packages API - Session:', session)

    if (!session) {
      console.error('Shop Packages API - No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SHOP') {
      console.error('Shop Packages API - User is not SHOP:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // First verify the shop user exists
    const { data: shopUser, error: shopUserError } = await supabase
      .from('User')
      .select('id, role')
      .eq('id', session.user.id)
      .eq('role', 'SHOP')
      .single()

    if (shopUserError) {
      console.error('Shop Packages API - Error verifying shop user:', shopUserError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء التحقق من حساب المتجر', details: shopUserError.message },
        { status: 500 }
      )
    }

    if (!shopUser) {
      console.error('Shop Packages API - Shop user not found:', session.user.id)
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب المتجر' },
        { status: 404 }
      )
    }

    console.log('Shop Packages API - Shop user verified:', shopUser)

    // First, let's check if there are any packages with this shopId
    const { data: packageCount, error: countError } = await supabase
      .from('package')
      .select('id', { count: 'exact' })
      .eq('shopId', session.user.id)

    if (countError) {
      console.error('Shop Packages API - Error counting packages:', countError)
    } else {
      console.log('Shop Packages API - Total packages found:', packageCount?.length || 0)
    }

    console.log('Shop Packages API - Fetching packages for shop:', session.user.id)

    const { data: packages, error: packagesError } = await supabase
      .from('package')
      .select(`
        id,
        trackingNumber,
        description,
        status,
        createdAt,
        updatedAt,
        userId,
        shopId,
        user:userId (
          id,
          fullName,
          email
        ),
        shop:shopId (
          id,
          fullName,
          email
        )
      `)
      .eq('shopId', session.user.id)
      .order('createdAt', { ascending: false })

    if (packagesError) {
      console.error('Shop Packages API - Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الطرود', details: packagesError.message },
        { status: 500 }
      )
    }

    console.log('Shop Packages API - Raw packages data:', packages)
    console.log('Shop Packages API - Successfully fetched packages:', packages?.length || 0)

    return NextResponse.json(packages || [])
  } catch (error) {
    console.error('Shop Packages API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع', details: error instanceof Error ? error.message : error },
      { status: 500 }
    )
  }
} 