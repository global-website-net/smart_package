import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type RouteHandlerParams = {
  params: {
    token: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteHandlerParams
): Promise<NextResponse> {
  try {
    const { token } = params

    // Find user with this reset token using raw query
    const user = await prisma.$queryRaw`
      SELECT * FROM "User"
      WHERE "resetToken" = ${token}
      AND "resetTokenExpiry" > NOW()
    `

    if (!user) {
      return NextResponse.json(
        { message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء التحقق من الرابط' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteHandlerParams
): Promise<NextResponse> {
  try {
    const { token } = params
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { message: 'كلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    // Find user with this reset token using raw query
    const user = await prisma.$queryRaw`
      SELECT * FROM "User"
      WHERE "resetToken" = ${token}
      AND "resetTokenExpiry" > NOW()
    `

    if (!user) {
      return NextResponse.json(
        { message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password and clear reset token using raw query
    await prisma.$executeRaw`
      UPDATE "User"
      SET "password" = ${hashedPassword},
          "resetToken" = NULL,
          "resetTokenExpiry" = NULL
      WHERE "id" = ${user.id}
    `

    return NextResponse.json(
      { message: 'تم إعادة تعيين كلمة المرور بنجاح' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
} 