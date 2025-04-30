import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if user is admin or owner using the session role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
    }

    // Fetch SHOP accounts from User table
    const { data, error } = await supabase
      .from('User')
      .select('id, fullname')
      .eq('role', 'SHOP')
      .order('fullname', { ascending: true })

    if (error) {
      console.error('Error fetching shops:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const shops = data.map(user => ({
      id: user.id,
      name: user.fullname
    }))

    return NextResponse.json(shops || [])
  } catch (error) {
    console.error('Error fetching shops:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المتاجر' },
      { status: 500 }
    )
  }
} 