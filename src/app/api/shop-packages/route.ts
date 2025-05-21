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

    // First verify the shop exists
    const { data: shop, error: shopError } = await supabase
      .from('shop')
      .select('id')
      .eq('id', session.user.id)
      .single()

    if (shopError) {
      console.error('Shop Packages API - Error verifying shop:', shopError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء التحقق من المتجر', details: shopError.message },
        { status: 500 }
      )
    }

    if (!shop) {
      console.error('Shop Packages API - Shop not found:', session.user.id)
      return NextResponse.json(
        { error: 'لم يتم العثور على المتجر' },
        { status: 404 }
      )
    }

    console.log('Shop Packages API - Fetching packages for shop:', session.user.id)

    const { data: packages, error: packagesError } = await supabase
      .from('package')
      .select(`
        id,
        trackingNumber,
        status,
        createdAt,
        updatedAt,
        user:userId (
          id,
          fullName,
          email
        ),
        shop:shopId (
          id,
          name,
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