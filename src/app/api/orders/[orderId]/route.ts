import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

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

export async function PATCH(request: NextRequest) {
  try {
    const orderId = request.url.split('/').pop()
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { status, totalAmount } = await request.json()

    // Validate totalAmount when status is AWAITING_PAYMENT
    if (status === 'AWAITING_PAYMENT' && (!totalAmount || totalAmount <= 0)) {
      return NextResponse.json(
        { error: 'يجب إدخال مبلغ الدفع عندما تكون الحالة في انتظار الدفع' },
        { status: 400 }
      )
    }

    // First check if the order exists
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('order')
      .select('id')
      .eq('id', orderId)
      .single()

    if (checkError || !existingOrder) {
      console.error('Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const { data: order, error } = await supabaseAdmin
      .from('order')
      .update({ 
        status,
        totalAmount: status === 'AWAITING_PAYMENT' ? totalAmount : null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        *,
        user:userId (
          fullName,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error in PATCH /api/orders/[orderId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 