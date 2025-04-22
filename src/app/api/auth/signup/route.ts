import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/db'

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
    const { email, password, fullName, governorate, town, phonePrefix, phoneNumber } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !governorate || !town || !phonePrefix || !phoneNumber) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user exists
    const userExists = await db.userExists(email)
    
    if (userExists) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Create the user
    const user = await db.createUser({
      email,
      password: hashedPassword,
      fullName,
      governorate,
      town,
      phonePrefix,
      phoneNumber,
      role: UserRole.REGULAR
    })

    if (!user) {
      throw new Error('Failed to create user')
    }

    // Create user in Supabase auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: UserRole.REGULAR,
        governorate: governorate,
        town: town,
        phone_prefix: phonePrefix,
        phone_number: phoneNumber
      }
    })

    if (authError) {
      // Delete the user from our database if Supabase auth fails
      await db.deleteUser(user.id)
      throw new Error('Failed to create Supabase auth user')
    }

    // Return success response without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error in signup:', error)
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Failed to create Supabase auth user')) {
        return NextResponse.json(
          { error: 'حدث خطأ أثناء إنشاء الحساب في نظام المصادقة' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
} 