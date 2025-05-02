import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Fetch all users with role REGULAR
    const { data: users, error } = await supabase
      .from('User')
      .select('id, fullName, email')
      .eq('role', 'REGULAR')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching regular users:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المستخدمين' },
        { status: 500 }
      )
    }

    // Format the response to match the expected structure
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.fullName || user.email?.split('@')[0] || 'مستخدم',
      email: user.email
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error in regular users route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 