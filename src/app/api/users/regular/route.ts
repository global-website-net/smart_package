import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Fetch regular users from the database
    const { data: users, error } = await supabase
      .from('User')
      .select('id, fullName, email')
      .eq('role', 'REGULAR')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب المستخدمين' }, { status: 500 })
    }

    // Format the response to match the expected structure
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.fullName,
      email: user.email
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error in users route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المستخدمين' },
      { status: 500 }
    )
  }
} 