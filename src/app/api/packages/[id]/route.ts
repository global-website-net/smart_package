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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const { userId } = await request.json()

    // Verify the package belongs to the user
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('package')
      .select('userId')
      .eq('id', params.id)
      .single()

    if (packageError) {
      throw new Error('فشل في جلب بيانات الطرد')
    }

    if (packageData.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'غير مصرح بتعديل هذا الطرد' },
        { status: 403 }
      )
    }

    // Update the package's shop (userId)
    const { error: updateError } = await supabaseAdmin
      .from('package')
      .update({ userId })
      .eq('id', params.id)

    if (updateError) {
      throw new Error('فشل في تحديث المتجر')
    }

    return NextResponse.json({ message: 'تم تحديث المتجر بنجاح' })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'حدث خطأ أثناء تحديث المتجر' },
      { status: 500 }
    )
  }
} 