import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { supabase } from '@/lib/supabase'

interface OrderUser {
  fullName: string
  email: string
}

interface OrderData {
  id: string
  userId: string
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes: string | null
  additionalInfo: string | null
  status: string
  createdAt: string
  updatedAt: string
  user: OrderUser | null
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

    const { data: orders, error } = await supabase
      .from('Order')
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
        user:userId (
          fullName,
          email
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الطلبات' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const formattedOrders = (orders as OrderData[]).map(order => ({
      ...order,
      user: {
        fullName: order.user?.fullName || 'غير معروف',
        email: order.user?.email || ''
      }
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    )
  }
} 