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

    const { amount } = await request.json()

    // Get user's wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance')
      .eq('userId', session.user.id)
      .single()

    if (walletError) {
      throw new Error('فشل في جلب رصيد المحفظة')
    }

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { message: 'رصيد غير كافي في المحفظة' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'رصيد كافي' })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'حدث خطأ أثناء التحقق من الرصيد' },
      { status: 500 }
    )
  }
} 