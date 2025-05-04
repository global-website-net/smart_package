import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    const { data: packages, error } = await supabase
      .from('package')
      .select(`
        id,
        trackingNumber,
        status,
        description,
        createdAt,
        updatedAt,
        user:User!userId (
          id,
          fullName,
          email
        ),
        shop:User!shopId (
          id,
          fullName
        )
      `)
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error in my-packages route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
}