import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database with case-insensitive email match
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('id')
      .ilike('email', session.user.email)

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
      )
    }

    // Use the first matching user
    const user = users[0]

    // Fetch orders for the user
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        id,
        purchaseSite,
        purchaseLink,
        phoneNumber,
        notes,
        additionalInfo,
        status,
        createdAt,
        updatedAt
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

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('Error in my-orders route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 