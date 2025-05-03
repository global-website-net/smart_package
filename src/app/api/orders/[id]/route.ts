import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const { status } = await request.json()
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update the order status
    const { error } = await supabase
      .from('order')
      .update({ 
        status, 
        updatedAt: new Date().toISOString() 
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating order status:', error)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Fetch the updated order with all columns
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('order')
      .select(`
        id,
        userId,
        purchaseSite,
        purchaseLink,
        phoneNumber,
        notes,
        additionalInfo,
        status,
        createdAt,
        updatedAt
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated order:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated order' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 