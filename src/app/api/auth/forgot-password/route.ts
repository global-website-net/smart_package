import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { generateResetToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Generate reset token and expiry
    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token and expiry to user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send reset password email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    
    await sendEmail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      text: `لإعادة تعيين كلمة المرور الخاصة بك، يرجى النقر على الرابط التالي:\n\n${resetUrl}\n\nينتهي هذا الرابط خلال ساعة واحدة.`,
      html: `
        <div dir="rtl">
          <h1>إعادة تعيين كلمة المرور</h1>
          <p>لإعادة تعيين كلمة المرور الخاصة بك، يرجى النقر على الرابط التالي:</p>
          <p><a href="${resetUrl}">إعادة تعيين كلمة المرور</a></p>
          <p>ينتهي هذا الرابط خلال ساعة واحدة.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    )
  }
}

// Add GET method to handle redirect
export async function GET() {
  return NextResponse.redirect(new URL('/auth/forgot-password', process.env.NEXT_PUBLIC_APP_URL))
} 