import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Delete user from Supabase
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', session.user.id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف الحساب' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'تم حذف الحساب بنجاح' })
  } catch (error) {
    console.error('Error in delete account route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الحساب' },
      { status: 500 }
    )
  }
} 