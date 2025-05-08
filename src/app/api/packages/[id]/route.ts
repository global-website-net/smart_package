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

type RouteContext = {
  params: {
    id: string
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Check if user is authenticated and is ADMIN/OWNER
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Delete the package
    const { error } = await supabaseAdmin
      .from('package')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting package:', error)
      return NextResponse.json(
        { error: 'Failed to delete package' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/packages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { message: 'معرف الطرد مطلوب' },
        { status: 400 }
      )
    }

    const { trackingNumber, status, description, shopId, userId } = await request.json()

    // Update the package with all fields
    const { data, error: updateError } = await supabaseAdmin
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
      .select(`
        *,
        user:userId (
          id,
          fullName,
          email
        ),
        shop:shopId (
          id,
          fullName,
          email
        )
      `)
      .single()

    if (updateError) {
      throw new Error('فشل في تحديث بيانات الطرد')
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'حدث خطأ أثناء تحديث بيانات الطرد' },
      { status: 500 }
    )
  }
} 