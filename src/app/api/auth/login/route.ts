import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير موجود' },
        { status: 404 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Check if user exists in Supabase auth
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email)

    if (getUserError && getUserError.message !== 'User not found') {
      console.error('Error checking Supabase user:', getUserError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الدخول' },
        { status: 500 }
      )
    }

    let authUser = existingUser

    // If user doesn't exist in Supabase auth, create them
    if (!existingUser) {
      console.log('Creating Supabase auth user...')
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          governorate: user.governorate,
          town: user.town,
          phone_prefix: user.phonePrefix,
          phone_number: user.phoneNumber
        }
      })

      if (createError) {
        console.error('Error creating Supabase user:', createError)
        return NextResponse.json(
          { error: 'حدث خطأ أثناء تسجيل الدخول' },
          { status: 500 }
        )
      }

      authUser = newUser
    }

    // Create a session for the user
    const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: authUser.user.id,
      email: user.email
    })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الجلسة' },
        { status: 500 }
      )
    }

    // Return user data and session
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        governorate: user.governorate,
        town: user.town,
        phonePrefix: user.phonePrefix,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
      session: session
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
} 