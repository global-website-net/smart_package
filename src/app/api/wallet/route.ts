import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('Wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      // If wallet doesn't exist, create one
      if (walletError.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('Wallet')
          .insert([
            {
              userId: session.user.id,
              balance: 0
            }
          ])
          .select()
          .single()

        if (createError) {
          console.error('Error creating wallet:', createError)
          return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء المحفظة' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          balance: newWallet.balance,
          transactions: []
        })
      }

      console.error('Error fetching wallet:', walletError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب بيانات المحفظة' },
        { status: 500 }
      )
    }

    // Get wallet transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('WalletTransaction')
      .select('*')
      .eq('walletId', wallet.id)
      .order('createdAt', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المعاملات' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      balance: wallet.balance,
      transactions: transactions
    })
  } catch (error) {
    console.error('Error in wallet route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في خدمة المحفظة' },
      { status: 500 }
    )
  }
} 