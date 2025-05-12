import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { packageId, newStatus } = await request.json()

    if (!packageId || !newStatus) {
      return NextResponse.json(
        { error: 'Package ID and new status are required' },
        { status: 400 }
      )
    }

    // Create a Supabase client with the service role key
    const supabase = createRouteHandlerClient({ cookies }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    // Update the package with the new status
    const { error: updateError } = await supabase
      .from('package')
      .update({ 
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .eq('id', packageId)

    if (updateError) {
      console.error('Error updating package:', updateError)
      return NextResponse.json(
        { error: 'Failed to update package status' },
        { status: 500 }
      )
    }

    // Fetch the updated package to return
    const { data: updatedPackage, error: fetchError } = await supabase
      .from('package')
      .select('*')
      .eq('id', packageId)
      .single()

    if (fetchError) {
      console.error('Error fetching updated package:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated package' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error in update-status route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 