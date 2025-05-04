import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { orderId, amount } = await request.json()

    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('order')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) throw orderError

    // Check if order exists and is in correct status
    if (!order || order.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'الطلب غير موجود أو غير قابل للدفع' },
        { status: 400 }
      )
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) throw walletError

    // Check if user has enough balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'رصيد المحفظة غير كافٍ' },
        { status: 400 }
      )
    }

    // Update wallet balance
    const { error: updateWalletError } = await supabase
      .from('wallet')
      .update({ balance: wallet.balance - amount })
      .eq('userId', session.user.id)

    if (updateWalletError) throw updateWalletError

    // Add transaction record
    const { error: transactionError } = await supabase
      .from('walletTransaction')
      .insert({
        userId: session.user.id,
        amount: amount,
        type: 'DEBIT',
        reason: `دفع مقابل الطلب ${orderId}`,
        orderId: orderId
      })

    if (transactionError) throw transactionError

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('order')
      .update({ status: 'ORDERING' })
      .eq('id', orderId)

    if (updateOrderError) throw updateOrderError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء عملية الدفع' },
      { status: 500 }
    )
  }
} 