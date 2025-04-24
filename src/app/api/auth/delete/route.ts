import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتنفيذ هذا الإجراء' },
        { status: 401 }
      )
    }

    // Delete user from authentication
    const { error } = await supabase.auth.admin.deleteUser(session.user.id)

    if (error) {
      console.error('Error deleting user from auth:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف حساب المصادقة' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'تم حذف حساب المصادقة بنجاح' })
  } catch (error) {
    console.error('Error in auth delete route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف حساب المصادقة' },
      { status: 500 }
    )
  }
} 