import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

// Create a single Supabase client instance with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a REGULAR user
    if (session.user.role !== 'REGULAR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get wallet data
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      // If wallet doesn't exist, create one
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
      .from('wallettransaction')
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
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a REGULAR user
    if (session.user.role !== 'REGULAR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { amount, type, reason } = await request.json()

    if (!amount || !type || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get wallet
    let { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      // If wallet doesn't exist, create one
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
            { error: 'حدث خطأ أثناء إنشاء المحفظة' },
            { status: 500 }
          )
        }

        // Use the newly created wallet
        wallet = newWallet
      } else {
        console.error('Error fetching wallet:', walletError)
        return NextResponse.json(
          { error: 'حدث خطأ أثناء جلب بيانات المحفظة' },
          { status: 500 }
        )
      }
    }

    // Calculate new balance
    const newBalance = type === 'CREDIT' 
      ? wallet.balance + amount 
      : wallet.balance - amount

    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'رصيد غير كافي' },
        { status: 400 }
      )
    }

    // Start a transaction
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
        { error: 'حدث خطأ أثناء إنشاء المعاملة' },
        { status: 500 }
      )
    }

    // Update wallet balance
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
        { error: 'حدث خطأ أثناء تحديث رصيد المحفظة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      balance: newBalance,
      transaction
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
} 