import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

// Initialize Supabase admin client with service role key
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
    // Check if user is authenticated and is ADMIN/OWNER
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, totalAmount } = await request.json()

    // Validate totalAmount when status is AWAITING_PAYMENT
    if (status === 'AWAITING_PAYMENT' && (!totalAmount || totalAmount <= 0)) {
      return NextResponse.json(
        { error: 'يجب إدخال مبلغ الدفع عندما تكون الحالة في انتظار الدفع' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('order')
      .update({
        status,
        totalAmount: status === 'AWAITING_PAYMENT' ? totalAmount : null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('Updated order:', data)
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/orders/update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 