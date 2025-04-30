import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.url.split('/').pop()

    const { error } = await supabase
      .from('Package')
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
    const body = await request.json()

    const { data, error } = await supabase
      .from('Package')
      .update({
        trackingNumber: body.trackingNumber,
        status: body.status,
        currentLocation: body.currentLocation,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating package:', error)
      return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/packages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 