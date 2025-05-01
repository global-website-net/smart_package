import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

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
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
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
    
    await resend.emails.send({
      from: 'Package Smart <noreply@packagesmart.com>',
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl">
          <h2>إعادة تعيين كلمة المرور</h2>
          <p>مرحباً ${user.name || 'عزيزي المستخدم'},</p>
          <p>لقد تلقيت هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرور لحسابك.</p>
          <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
          <p>ينتهي صلاحية هذا الرابط بعد ساعة واحدة.</p>
          <p>مع أطيب التحيات،<br>فريق Package Smart</p>
        </div>
      `,
    })

    return NextResponse.json(
      { message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    )
  }
} 