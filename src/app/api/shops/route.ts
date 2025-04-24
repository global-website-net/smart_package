import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if user is admin or owner
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
      return NextResponse.json({ error: 'حدث خطأ في التحقق من الصلاحيات' }, { status: 500 })
    }

    if (userData.role !== 'ADMIN' && userData.role !== 'OWNER') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
    }

    // Fetch all shops from the Shop table
    const { data: shops, error } = await supabase
      .from('Shop')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching shops:', error)
      return NextResponse.json({ error: 'حدث خطأ في جلب المتاجر' }, { status: 500 })
    }

    return NextResponse.json(shops)
  } catch (error) {
    console.error('Error in shops API:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
} 