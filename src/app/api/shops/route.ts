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

    // Fetch shop accounts from the database
    const { data: shops, error } = await supabase
      .from('User')
      .select('id, fullName, email')
      .eq('role', 'SHOP')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching shops:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء جلب المتاجر' }, { status: 500 })
    }

    // Format the response to match the expected structure
    const formattedShops = shops.map(shop => ({
      id: shop.id,
      name: shop.fullName || shop.email?.split('@')[0] || 'متجر'
    }))

    return NextResponse.json(formattedShops)
  } catch (error) {
    console.error('Error in shops route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المتاجر' },
      { status: 500 }
    )
  }
} 