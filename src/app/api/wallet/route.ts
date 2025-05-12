import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Wallet API GET session:', session)

    if (!session) {
      console.error('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'REGULAR') {
      console.error('User is not REGULAR:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      console.error('Supabase walletError:', walletError)
      if (walletError.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallet')
          .insert([
            {
              userId: session.user.id,
              balance: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (createError) {
          console.error('Error creating wallet:', createError)
          return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء المحفظة', details: createError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({
          balance: newWallet.balance,
          transactions: []
        })
      }
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب بيانات المحفظة', details: walletError.message },
        { status: 500 }
      )
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('wallettransaction')
      .select('*')
      .eq('walletid', wallet.id)
      .order('createdAt', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المعاملات', details: transactionsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      balance: wallet.balance,
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Unexpected error in wallet GET:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع', details: error instanceof Error ? error.message : error },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Wallet API POST session:', session)

    if (!session) {
      console.error('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'REGULAR') {
      console.error('User is not REGULAR:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { amount, type, reason } = await request.json()
    console.log('POST body:', { amount, type, reason })

    if (!amount || !type || !reason) {
      console.error('Missing required fields:', { amount, type, reason })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      console.error('Error fetching wallet:', walletError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب بيانات المحفظة', details: walletError.message },
        { status: 500 }
      )
    }

    const newBalance = type === 'CREDIT' 
      ? wallet.balance + amount 
      : wallet.balance - amount

    if (newBalance < 0) {
      console.error('Insufficient balance:', { newBalance, walletBalance: wallet.balance, amount })
      return NextResponse.json(
        { error: 'رصيد غير كافي' },
        { status: 400 }
      )
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('wallettransaction')
      .insert([
        {
          walletId: wallet.id,
          amount,
          type,
          reason,
          createdAt: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء المعاملة', details: transactionError.message },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from('wallet')
      .update({ 
        balance: newBalance,
        updatedAt: new Date().toISOString()
      })
      .eq('id', wallet.id)

    if (updateError) {
      console.error('Error updating wallet:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث رصيد المحفظة', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      balance: newBalance,
      transaction
    })
  } catch (error) {
    console.error('Unexpected error in wallet POST:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع', details: error instanceof Error ? error.message : error },
      { status: 500 }
    )
  }
} 