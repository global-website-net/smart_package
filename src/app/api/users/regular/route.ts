import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    // Fetch all users with role REGULAR
    const { data: users, error } = await supabase
      .from('User')
      .select('id, fullName, email, role')
      .eq('role', 'REGULAR')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching regular users:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المستخدمين' },
        { status: 500 }
      )
    }

    console.log('Fetched regular users:', users)

    if (!users || users.length === 0) {
      console.log('No regular users found in the database')
      return NextResponse.json([])
    }

    // Format the response to match the expected structure
    const formattedUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName || user.email?.split('@')[0] || 'مستخدم',
      email: user.email,
      role: user.role
    }))

    console.log('Formatted regular users:', formattedUsers)

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error in regular users route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 