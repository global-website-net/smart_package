import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@prisma/client'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    console.log('Starting signup process...')
    const body = await request.json()
    console.log('Request body:', { ...body, password: '[REDACTED]' })
    
    const { 
      email, 
      password, 
      fullName,
      governorate,
      town,
      phonePrefix,
      phoneNumber
    } = body

    // Validate required fields
    if (!email || !password || !fullName || !governorate || !town || !phonePrefix || !phoneNumber) {
      console.log('Missing required fields:', { 
        email, 
        hasPassword: !!password, 
        fullName,
        governorate,
        town,
        phonePrefix,
        phoneNumber
      })
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
      console.log('User already exists:', email)
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

    // Create Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: password, // Use the original password for Supabase auth
      email_confirm: true,
      user_metadata: {
        fullName: user.fullName,
        role: user.role,
        governorate: user.governorate,
        town: user.town,
        phonePrefix: user.phonePrefix,
        phoneNumber: user.phoneNumber
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      // Delete the user from our database if Supabase auth fails
      await prisma.user.delete({
        where: { id: user.id }
      })
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب' },
        { status: 500 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    })
  } catch (error: any) {
    console.error('Detailed error in signup:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
} 