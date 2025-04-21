import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
} 