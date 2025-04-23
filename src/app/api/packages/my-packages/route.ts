import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's packages using Supabase
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        *,
        Status:status_id (
          name,
          description
        ),
        Shop:shop_id (
          fullName,
          email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      packages: packages?.map(pkg => ({
        ...pkg,
        status: pkg.Status,
        shop: pkg.Shop
      }))
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 