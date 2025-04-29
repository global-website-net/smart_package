import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // First, delete the user from the database
    const { error: dbError } = await supabase
      .from('User')
      .delete()
      .eq('id', session.user.id)

    if (dbError) {
      console.error('Error deleting user from database:', dbError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف الحساب من قاعدة البيانات' },
        { status: 500 }
      )
    }

    // Then, delete the user from auth using admin client
    const { error: authError } = await supabase.auth.admin.deleteUser(
      session.user.id
    )

    if (authError) {
      console.error('Error deleting user from auth:', authError)
      // Even if auth deletion fails, we still return success since the user is deleted from the database
      // This prevents the user from accessing the application even if auth deletion fails
      return NextResponse.json({ success: true })
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