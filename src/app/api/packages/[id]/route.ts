import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import { createClient } from '@supabase/supabase-js'

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

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.url.split('/').pop()

    const { error } = await supabaseAdmin
      .from('package')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting package:', error)
      return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/packages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    // Get the request body
    const body = await request.json()
    const { trackingNumber, status, description, shopId, userId } = body

    // First check if the package exists
    const { data: existingPackage, error: checkError } = await supabaseAdmin
      .from('package')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingPackage) {
      console.error('Package not found:', id)
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Update the package
    const { data, error } = await supabaseAdmin
      .from('package')
      .update({
        trackingNumber,
        status,
        description,
        shopId,
        userId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating package:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in PATCH /api/packages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 