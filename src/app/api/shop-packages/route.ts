import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shopId = session.user.id

  try {
    const { data, error } = await supabase
      .from('package')
      .select(`
        *,
        user:userId (
          id,
          fullName,
          email
        ),
        shop:shopId (
          id,
          name,
          email
        )
      `)
      .eq('shopId', shopId)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in shop-packages route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 