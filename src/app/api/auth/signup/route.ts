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
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    const user = await prisma.user.create({
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

    // Create user in Supabase auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        role: user.role,
        governorate: user.governorate,
        town: user.town,
        phone_prefix: user.phonePrefix,
        phone_number: user.phoneNumber
      }
    })

    if (authError) {
      // Delete the user from our database if Supabase auth fails
      await prisma.user.delete({
        where: { id: user.id }
      })
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
  } finally {
    // Ensure the Prisma connection is properly closed
    await prisma.$disconnect()
  }
} 