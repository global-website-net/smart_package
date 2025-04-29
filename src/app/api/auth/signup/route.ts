import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/db'

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
    const { email, password, fullName, governorate, town, phonePrefix, phoneNumber } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !governorate || !town || !phonePrefix || !phoneNumber) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if user exists in Supabase auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    const existingAuthUser = users?.users?.find(user => user.email === email)

    if (existingAuthUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Hash password for database storage
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Supabase auth first
    const { data: authUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: UserRole.REGULAR,
        governorate,
        town,
        phone_prefix: phonePrefix,
        phone_number: phoneNumber
      }
    })

    if (createAuthError || !authUser?.user) {
      console.error('Error creating auth user:', createAuthError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب في نظام المصادقة' },
        { status: 500 }
      )
    }

    try {
      // Create user in database
      const dbUser = await db.createUser({
        email,
        password: hashedPassword,
        fullName,
        governorate,
        town,
        phonePrefix,
        phoneNumber,
        role: UserRole.REGULAR
      })

      // Return success response without password
      const { password: _, ...userWithoutPassword } = dbUser
      return NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        user: userWithoutPassword
      })
    } catch (dbError) {
      // If database user creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id)
      console.error('Error creating database user:', dbError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب في قاعدة البيانات' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in signup:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
} 