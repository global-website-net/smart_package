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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database - using a different approach
    // First check if user exists using a raw query to avoid prepared statement issues
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = ${email}
    `
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Create the user using a raw query with proper enum casting
    const newUser = await prisma.$queryRaw`
      INSERT INTO "User" (
        "email", "password", "fullName", "governorate", "town", 
        "phonePrefix", "phoneNumber", "role", "createdAt", "updatedAt"
      ) VALUES (
        ${email}, ${hashedPassword}, ${fullName}, ${governorate}, ${town},
        ${phonePrefix}, ${phoneNumber}, ${UserRole.REGULAR}::"UserRole", NOW(), NOW()
      ) RETURNING *
    `
    
    // Extract the user from the raw query result
    const user = Array.isArray(newUser) && newUser.length > 0 ? newUser[0] : null
    
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
      await prisma.$queryRaw`
        DELETE FROM "User" WHERE id = ${user.id}
      `
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