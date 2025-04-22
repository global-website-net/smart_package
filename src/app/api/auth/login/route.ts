import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
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

    // Create Supabase auth user if it doesn't exist
    console.log('Creating Supabase auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
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

    if (authError) {
      console.error('Supabase auth error:', authError)
      // If user already exists in Supabase, that's fine - we can proceed
      if (authError.message !== 'User already registered') {
        return NextResponse.json(
          { error: 'حدث خطأ أثناء تسجيل الدخول' },
          { status: 500 }
        )
      }
    }

    // Generate access token
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email
    })

    if (tokenError) {
      console.error('Token generation error:', tokenError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الجلسة' },
        { status: 500 }
      )
    }

    // Return user data and token
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
      token: tokenData
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
} 