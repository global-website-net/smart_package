import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, governorate, town, phonePrefix, phoneNumber, password, role = 'REGULAR' } = body

    // Validate required fields
    if (!fullName || !email || !governorate || !town || !phonePrefix || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['REGULAR', 'SHOP', 'ADMIN', 'OWNER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'نوع الحساب غير صالح' },
        { status: 400 }
      )
    }

    // Check if email already exists
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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error in signup:', error)
    
    // Handle specific database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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