import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    console.log('Starting login process...')
    const body = await request.json()
    console.log('Request body:', { ...body, password: '[REDACTED]' })
    
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields:', { email, hasPassword: !!password })
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    console.log('Finding user...')
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    console.log('Verifying password...')
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    console.log('Creating Supabase auth user...')
    // Create or update Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.upsertUser({
      email: user.email,
      password: password, // Use the original password for Supabase auth
      email_confirm: true,
      user_metadata: {
        fullName: user.fullName,
        role: user.role
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الدخول' },
        { status: 500 }
      )
    }

    console.log('Generating session...')
    // Generate session
    const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: authUser.user.id
    })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الدخول' },
        { status: 500 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword,
      session: session
    })
  } catch (error: any) {
    console.error('Detailed error in login:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
} 