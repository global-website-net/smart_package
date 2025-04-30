import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'

// Create a Supabase client with service role key for admin operations
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

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // First, delete the user from the database using admin client
    const { error: dbError } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('email', session.user.email)

    if (dbError) {
      console.error('Error deleting user from database:', dbError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف الحساب من قاعدة البيانات' },
        { status: 500 }
      )
    }

    // Delete the user's auth account using admin client
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      session.user.id
    )

    if (authError) {
      console.error('Error deleting user from auth:', authError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف الحساب من نظام المصادقة' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete account API:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 