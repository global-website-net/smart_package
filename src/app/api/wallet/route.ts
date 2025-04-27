import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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
              balance: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
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
      .from('WalletTransaction')
      .select('*')
      .eq('walletId', wallet.id)
      .order('createdAt', { ascending: false })

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
      .from('Wallet')
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
      .from('WalletTransaction')
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
      throw transactionError
    }

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('Wallet')
      .update({ 
        balance: newBalance,
        updatedAt: new Date().toISOString()
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