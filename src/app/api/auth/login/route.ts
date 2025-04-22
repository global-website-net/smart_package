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

    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    })

    if (signInError) {
      // Only create user if they don't exist in Supabase auth
      if (signInError.message.includes('Invalid login credentials')) {
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
          return NextResponse.json(
            { error: 'حدث خطأ أثناء تسجيل الدخول' },
            { status: 500 }
          )
        }

        // Try to sign in again after creating the user
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: password
        })

        if (newSignInError) {
          console.error('Sign in error after user creation:', newSignInError)
          return NextResponse.json(
            { error: 'حدث خطأ أثناء تسجيل الدخول' },
            { status: 500 }
          )
        }

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
          session: newSignInData.session
        })
      }

      console.error('Sign in error:', signInError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الدخول' },
        { status: 500 }
      )
    }

    // Return user data and session from successful sign in
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
      session: signInData.session
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
} 