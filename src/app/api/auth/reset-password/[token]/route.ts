import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  context: { params: { token: string } }
) {
  try {
    const { token } = context.params

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token hasn't expired
        },
      },
    })

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
  context: { params: { token: string } }
) {
  try {
    const { token } = context.params
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { message: 'كلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token hasn't expired
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

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