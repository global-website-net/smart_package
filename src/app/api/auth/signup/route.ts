import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    console.log('Starting signup process...')
    const body = await request.json()
    console.log('Request body:', { ...body, password: '[REDACTED]' })
    
    const { fullName, email, governorate, town, phonePrefix, phoneNumber, password, role = 'REGULAR' } = body

    // Validate required fields
    if (!fullName || !email || !governorate || !town || !phonePrefix || !phoneNumber || !password) {
      console.log('Missing required fields:', { fullName, email, governorate, town, phonePrefix, phoneNumber, hasPassword: !!password })
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['REGULAR', 'SHOP', 'ADMIN', 'OWNER']
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role)
      return NextResponse.json(
        { error: 'نوع الحساب غير صالح' },
        { status: 400 }
      )
    }

    console.log('Checking for existing user...')
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Email already exists:', email)
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    console.log('Hashing password...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log('Creating user...')
    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        governorate,
        town,
        phonePrefix,
        phoneNumber,
        password: hashedPassword,
        role
      }
    })

    console.log('User created successfully:', { id: user.id, email: user.email })

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
      code: error?.code,
      stack: error?.stack
    })
    
    // Handle specific database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error details:', {
        code: error.code,
        meta: error.meta,
        message: error.message
      })
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
      
      if (error.code === 'P1001') {
        return NextResponse.json(
          { error: 'لا يمكن الاتصال بقاعدة البيانات' },
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