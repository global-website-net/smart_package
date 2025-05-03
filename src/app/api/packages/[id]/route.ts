import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.url.split('/').pop()

    const { error } = await supabase
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

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 })
    }

    const { status } = await request.json()
    const id = context.params.id

    const { error } = await supabase
      .from('package')
      .update({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating package:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الطرد' }, { status: 500 })
    }

    return NextResponse.json({ message: 'تم تحديث الطرد بنجاح' })
  } catch (error) {
    console.error('Error in PATCH /api/packages/[id]:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
} 