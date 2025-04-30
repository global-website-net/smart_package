import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database with case-insensitive email match
    const { data: user, error: userError } = await supabase
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

    const body = await request.json()
    const { purchaseSite, purchaseLink, phoneNumber, notes, additionalInfo } = body

    // Validate required fields
    if (!purchaseSite || !purchaseLink || !phoneNumber) {
      return NextResponse.json(
        { error: 'موقع الشراء، لينك الشراء، ورقم الهاتف مطلوبون' },
        { status: 400 }
      )
    }

    // Create order in database
    const { data: orderData, error: orderError } = await supabase
      .from('Order')
      .insert([
        {
          id: uuidv4(),
          userId: user.id,
          purchaseSite,
          purchaseLink,
          phoneNumber,
          notes,
          additionalInfo,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الطلب' },
        { status: 500 }
      )
    }

    return NextResponse.json(orderData)
  } catch (error) {
    console.error('Error in create order route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 