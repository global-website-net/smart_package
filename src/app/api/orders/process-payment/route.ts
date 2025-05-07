import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const { orderId, amount } = await request.json()

    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('order')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      throw new Error('فشل في جلب بيانات الطلب')
    }

    if (order.status !== 'AWAITING_PAYMENT') {
      throw new Error('حالة الطلب غير صالحة للدفع')
    }

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallet')
      .update({ balance: supabase.rpc('decrease_balance', { amount }) })
      .eq('userId', session.user.id)

    if (walletError) {
      throw new Error('فشل في تحديث رصيد المحفظة')
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('order')
      .update({ status: 'ORDERING' })
      .eq('id', orderId)

    if (updateError) {
      throw new Error('فشل في تحديث حالة الطلب')
    }

    return NextResponse.json({ message: 'تم معالجة الدفع بنجاح' })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'حدث خطأ أثناء معالجة الدفع' },
      { status: 500 }
    )
  }
} 