import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createTransport } from 'nodemailer'
import crypto from 'crypto'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

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
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, email, fullName')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('User')
      .update({
        resetToken,
        resetTokenExpiry,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error storing reset token:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء معالجة طلب إعادة تعيين كلمة المرور' },
        { status: 500 }
      )
    }

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${resetToken}`
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl">
          <h2>مرحباً ${user.fullName}،</h2>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
          <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور الخاصة بك:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>ينتهي هذا الرابط خلال ساعة واحدة.</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
          <p>مع تحياتنا،<br>فريق التطبيق</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    })
  } catch (error) {
    console.error('Error in password reset request:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلب إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
} 