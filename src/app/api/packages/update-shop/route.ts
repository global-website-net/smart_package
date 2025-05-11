import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { packageId, newShopId } = await request.json()

    if (!packageId || !newShopId) {
      return NextResponse.json(
        { error: 'Package ID and new shop ID are required' },
        { status: 400 }
      )
    }

    // Create a Supabase client with the service role key
    const supabase = createRouteHandlerClient({ cookies }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    // Update the package with the new shop ID
    const { error: updateError } = await supabase
      .from('package')
      .update({ 
        shopId: newShopId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', packageId)

    if (updateError) {
      console.error('Error updating package:', updateError)
      return NextResponse.json(
        { error: 'Failed to update package' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update-shop route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 