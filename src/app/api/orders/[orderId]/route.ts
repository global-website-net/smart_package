import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
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

    const { data: order, error } = await supabase
      .from('order')
      .update({ 
        status,
        totalAmount: status === 'AWAITING_PAYMENT' ? totalAmount : null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.orderId)
      .select()
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