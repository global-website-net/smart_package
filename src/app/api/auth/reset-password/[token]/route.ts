import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type UserWithResetToken = {
  id: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = params.token

    // Find user with this reset token using raw query
    const users = await prisma.$queryRaw<UserWithResetToken[]>`
      SELECT id, "resetToken", "resetTokenExpiry"
      FROM "User"
      WHERE "resetToken" = ${token}
      AND "resetTokenExpiry" > NOW()
    `

    const user = users[0]
    if (!user) {
      return new Response(
        JSON.stringify({ 
          message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Token validation error:', error)
    return new Response(
      JSON.stringify({ 
        message: 'حدث خطأ أثناء التحقق من الرابط' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = params.token
    const { password } = await request.json()

    if (!password) {
      return new Response(
        JSON.stringify({ 
          message: 'كلمة المرور مطلوبة' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
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
      return new Response(
        JSON.stringify({ 
          message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
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

    return new Response(
      JSON.stringify({ 
        message: 'تم إعادة تعيين كلمة المرور بنجاح' 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return new Response(
      JSON.stringify({ 
        message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 