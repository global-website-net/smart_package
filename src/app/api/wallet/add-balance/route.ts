import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const { amount, cardDetails } = await request.json()

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'المبلغ غير صحيح' },
        { status: 400 }
      )
    }

    if (!cardDetails?.number || !cardDetails?.name || !cardDetails?.expiry || !cardDetails?.cvc) {
      return NextResponse.json(
        { error: 'معلومات البطاقة غير مكتملة' },
        { status: 400 }
      )
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('Wallet')
      .select('id, balance')
      .eq('userid', session.user.id)
      .single()

    if (walletError) {
      console.error('Error fetching wallet:', walletError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب معلومات المحفظة' },
        { status: 500 }
      )
    }

    // In a real application, you would integrate with a payment gateway here
    // For this example, we'll simulate a successful payment
    const paymentSuccessful = true

    if (!paymentSuccessful) {
      return NextResponse.json(
        { error: 'فشلت عملية الدفع' },
        { status: 400 }
      )
    }

    // Update wallet balance
    const newBalance = wallet.balance + amount
    const { error: updateError } = await supabase
      .from('Wallet')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id)

    if (updateError) {
      console.error('Error updating wallet:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث الرصيد' },
        { status: 500 }
      )
    }

    // Record the transaction
    const { error: transactionError } = await supabase
      .from('WalletTransaction')
      .insert([
        {
          walletid: wallet.id,
          amount,
          type: 'CREDIT',
          reason: 'إيداع عبر البطاقة الائتمانية',
          created_at: new Date().toISOString()
        }
      ])

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      // Don't return error here as the balance was already updated
    }

    return NextResponse.json({
      success: true,
      balance: newBalance
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الدفع' },
      { status: 500 }
    )
  }
} 