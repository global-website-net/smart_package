import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database to check role
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      console.error('User lookup error:', userError)
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
      )
    }

    // Check if user is ADMIN or OWNER
    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بإنشاء طرد' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, shopId, userId, description } = body

    // Validate required fields
    if (!status || !shopId || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Generate a unique tracking number
    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // Create the package in Supabase
    const { data: newPackage, error: packageError } = await supabase
      .from('package')
      .insert([
        {
          trackingNumber,
          status,
          userId,
          shopId,
          description: description || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (packageError) {
      console.error('Package creation error:', packageError)
      throw packageError
    }

    return NextResponse.json(newPackage)
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الطرد' },
      { status: 500 }
    )
  }
} 