import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database with case-insensitive email match using admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id')
      .ilike('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    if (!user) {
      console.error('User not found for email:', session.user.email)
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول' },
        { status: 404 }
      )
    }

    // Get orders for the user using admin client
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('order')
      .select(`
        id,
        userId,
        purchaseSite,
        purchaseLink,
        phoneNumber,
        notes,
        additionalInfo,
        status,
        createdAt,
        updatedAt,
        user:User (
          fullName,
          email
        )
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الطلبات' },
        { status: 500 }
      )
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error in get orders route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 