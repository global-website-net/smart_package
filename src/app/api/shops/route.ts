import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتنفيذ هذا الإجراء' },
        { status: 401 }
      )
    }

    const { data: shops, error } = await supabase
      .from('User')
      .select(`
        id,
        fullName,
        email
      `)
      .eq('role', 'SHOP')
      .order('fullName', { ascending: true })

    if (error) {
      console.error('Error fetching shops:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المتاجر' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const formattedShops = shops.map(shop => ({
      id: shop.id,
      name: shop.fullName,
      email: shop.email
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