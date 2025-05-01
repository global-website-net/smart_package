import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send reset password email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${resetToken}`
    
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Smart Package <noreply@smartpackage.com>',
        to: email,
        subject: 'إعادة تعيين كلمة المرور',
        html: `
          <div dir="rtl">
            <h2>إعادة تعيين كلمة المرور</h2>
            <p>مرحباً ${user.name},</p>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.</p>
            <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
            <p>مع تحياتنا،<br>فريق Smart Package</p>
          </div>
        `,
      })
    }

    return NextResponse.json(
      { message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    )
  }
} 