import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Fetch shops from the database
    const { data: shops, error } = await supabase
      .from('Shop')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching shops:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب المتاجر' }, { status: 500 })
    }

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Error in shops route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المتاجر' },
      { status: 500 }
    )
  }
} 