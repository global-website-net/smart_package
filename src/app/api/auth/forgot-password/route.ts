import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save reset token to user
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send email with reset link
    const resend = new Resend(process.env.RESEND_API_KEY)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Smart Package <noreply@smartpackage.com>',
        to: email,
        subject: 'إعادة تعيين كلمة المرور',
        html: `
          <div dir="rtl">
            <h1>إعادة تعيين كلمة المرور</h1>
            <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            <p>لإعادة تعيين كلمة المرور، انقر على الرابط أدناه:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>ينتهي هذا الرابط خلال 24 ساعة.</p>
          </div>
        `,
      })
    } else {
      console.log('Resend API key not found, skipping email send')
      console.log('Reset link:', resetLink)
    }

    return NextResponse.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    )
  }
} 