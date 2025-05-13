import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'

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

// Function to generate a unique order number
async function generateUniqueOrderNumber(): Promise<string> {
  const prefix = 'ORD'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const orderNumber = `${prefix}-${timestamp}-${random}`

  // Check if the order number already exists
  const { data: existingOrder } = await supabaseAdmin
    .from('order')
    .select('orderNumber')
    .eq('orderNumber', orderNumber)
    .single()

  // If the order number exists, generate a new one recursively
  if (existingOrder) {
    return generateUniqueOrderNumber()
  }

  return orderNumber
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { purchaseSite, purchaseLink, phoneNumber, notes, additionalInfo } = body

    // Validate required fields
    if (!purchaseSite || !purchaseLink || !phoneNumber) {
      return NextResponse.json(
        { error: 'موقع الشراء، لينك الشراء، ورقم الهاتف مطلوبون' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = await generateUniqueOrderNumber()

    // Create order in database using admin client
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('order')
      .insert([
        {
          userId: user.id,
          purchaseSite,
          purchaseLink,
          phoneNumber,
          notes,
          additionalInfo,
          status: 'PENDING_APPROVAL',
          orderNumber,
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