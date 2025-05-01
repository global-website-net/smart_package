import { NextRequest, NextResponse } from 'next/server'
import type { NextApiRequest } from 'next/types'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type UserWithResetToken = {
  id: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
): Promise<Response> {
  try {
    const { token } = params

    // Find user with this reset token using raw query
    const users = await prisma.$queryRaw<UserWithResetToken[]>`
      SELECT id, "resetToken", "resetTokenExpiry"
      FROM "User"
      WHERE "resetToken" = ${token}
      AND "resetTokenExpiry" > NOW()
    `

    const user = users[0]
    if (!user) {
      return Response.json(
        { message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    return Response.json({ valid: true })
  } catch (error) {
    console.error('Token validation error:', error)
    return Response.json(
      { message: 'حدث خطأ أثناء التحقق من الرابط' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
): Promise<Response> {
  try {
    const { token } = params
    const { password } = await request.json()

    if (!password) {
      return Response.json(
        { message: 'كلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    // Find user with this reset token using raw query
    const users = await prisma.$queryRaw<UserWithResetToken[]>`
      SELECT id, "resetToken", "resetTokenExpiry"
      FROM "User"
      WHERE "resetToken" = ${token}
      AND "resetTokenExpiry" > NOW()
    `

    const user = users[0]
    if (!user) {
      return Response.json(
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

    return Response.json(
      { message: 'تم إعادة تعيين كلمة المرور بنجاح' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return Response.json(
      { message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
} 