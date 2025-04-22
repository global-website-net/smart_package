import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@prisma/client'

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

    // Check if user already exists
    let existingUser = null
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      })
    } catch (dbError) {
      console.error('Database error when checking existing user:', dbError)
      // Continue with signup process even if this check fails
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    let user = null
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          governorate,
          town,
          phonePrefix,
          phoneNumber,
          role: UserRole.REGULAR
        }
      })
    } catch (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب' },
        { status: 500 }
      )
    }

    // Return success response without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Detailed error in signup:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
} 