import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { trackingNumber, status, shopId, description, userId } = data

    const { data: packageData, error } = await supabase
      .from('package')
      .insert([
        {
          trackingNumber,
          status,
          description,
          userId,
          shopId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error in package creation:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الشحنة' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if user is authenticated and is ADMIN/OWNER
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('package')
      .select(`
        *,
        shop:shopId (id, fullName),
        user:userId (id, fullName)
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 