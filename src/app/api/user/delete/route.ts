import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتنفيذ هذا الإجراء' },
        { status: 401 }
      )
    }

    // First, delete the user from the database table
    const { error: deleteError } = await supabase
      .from('User')
      .delete()
      .eq('email', session.user.email)

    if (deleteError) {
      console.error('Error deleting user from database:', deleteError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف الحساب' },
        { status: 500 }
      )
    }

    // Then, delete the user from Authentication using the service role
    const { error: authError } = await supabase.auth.signOut()

    if (authError) {
      console.error('Error signing out user:', authError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الخروج' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete account route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الحساب' },
      { status: 500 }
    )
  }
} 