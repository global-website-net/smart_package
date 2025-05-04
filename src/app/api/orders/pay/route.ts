import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

// Initialize Supabase admin client
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id')
      .ilike('email', session.user.email)
      .single()

    if (userError || !user) {
      console.error('User lookup error:', userError)
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
      )
    }

    const { orderId, amount } = await request.json()

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400 }
      )
    }

    // Get the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('order')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order lookup error:', orderError)
      return NextResponse.json(
        { error: 'لم يتم العثور على الطلب' },
        { status: 404 }
      )
    }

    // Verify order belongs to user
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالدفع لهذا الطلب' },
        { status: 403 }
      )
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallet')
      .select('*')
      .eq('userId', user.id)
      .single()

    if (walletError) {
      console.error('Wallet lookup error:', walletError)
      return NextResponse.json(
        { error: 'لم يتم العثور على المحفظة' },
        { status: 404 }
      )
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'رصيد المحفظة غير كافٍ' },
        { status: 400 }
      )
    }

    // Update wallet balance
    const { error: updateWalletError } = await supabaseAdmin
      .from('wallet')
      .update({ 
        balance: wallet.balance - amount,
        updatedAt: new Date().toISOString()
      })
      .eq('id', wallet.id)

    if (updateWalletError) {
      console.error('Wallet update error:', updateWalletError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث المحفظة' },
        { status: 500 }
      )
    }

    // Create wallet transaction
    const { error: transactionError } = await supabaseAdmin
      .from('walletTransaction')
      .insert([{
        userId: user.id,
        walletId: wallet.id,
        amount: amount,
        type: 'DEBIT',
        reason: `دفع مقابل الطلب ${orderId}`,
        orderId: orderId,
        createdAt: new Date().toISOString()
      }])

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      // Rollback wallet update
      await supabaseAdmin
        .from('wallet')
        .update({ 
          balance: wallet.balance,
          updatedAt: new Date().toISOString()
        })
        .eq('id', wallet.id)

      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل المعاملة' },
        { status: 500 }
      )
    }

    // Update order status
    const { error: updateOrderError } = await supabaseAdmin
      .from('order')
      .update({ 
        status: 'ORDERING',
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateOrderError) {
      console.error('Order update error:', updateOrderError)
      // Rollback transaction and wallet update
      await supabaseAdmin
        .from('walletTransaction')
        .delete()
        .eq('orderId', orderId)

      await supabaseAdmin
        .from('wallet')
        .update({ 
          balance: wallet.balance,
          updatedAt: new Date().toISOString()
        })
        .eq('id', wallet.id)

      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث حالة الطلب' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'تم الدفع بنجاح',
      newBalance: wallet.balance - amount
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الدفع' },
      { status: 500 }
    )
  }
} 