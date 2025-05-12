import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const { amount } = await request.json()
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'المبلغ غير صالح' },
        { status: 400 }
      )
    }

    // Get user's wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      console.error('Error fetching wallet:', walletError)
      if (walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create it
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
          .select('balance')
          .single()

        if (createError) {
          console.error('Error creating wallet:', createError)
          return NextResponse.json(
            { message: 'حدث خطأ أثناء إنشاء المحفظة' },
            { status: 500 }
          )
        }

        if (newWallet.balance < amount) {
          return NextResponse.json(
            { message: 'رصيد غير كافي في المحفظة' },
            { status: 400 }
          )
        }

        return NextResponse.json({ message: 'رصيد كافي' })
      }

      return NextResponse.json(
        { message: 'فشل في جلب رصيد المحفظة' },
        { status: 500 }
      )
    }

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { message: 'رصيد غير كافي في المحفظة' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'رصيد كافي' })
  } catch (error: any) {
    console.error('Error in check-balance:', error)
    return NextResponse.json(
      { message: error.message || 'حدث خطأ أثناء التحقق من الرصيد' },
      { status: 500 }
    )
  }
} 