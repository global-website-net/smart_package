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
              userid: session.user.id,
              balance: 0,
              createdat: new Date().toISOString(),
              updatedat: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return NextResponse.json({
          balance: newWallet.balance,
          transactions: []
        })
      }
      throw walletError
    }

    // Get wallet transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('wallettransaction')
      .select('*')
      .eq('walletid', wallet.id)
      .order('createdat', { ascending: false })

    if (transactionsError) {
      throw transactionsError
    }

    return NextResponse.json({
      balance: wallet.balance,
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
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
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      throw walletError
    }

    // Calculate new balance
    const newBalance = type === 'CREDIT' 
      ? wallet.balance + amount 
      : wallet.balance - amount

    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Start a transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('wallettransaction')
      .insert([
        {
          walletid: wallet.id,
          amount,
          type,
          reason,
          createdat: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallet')
      .update({ 
        balance: newBalance,
        updatedat: new Date().toISOString()
      })
      .eq('id', wallet.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      balance: newBalance,
      transaction
    })
  } catch (error) {
    console.error('Error processing wallet transaction:', error)
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    )
  }
} 