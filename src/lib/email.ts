import { Resend } from 'resend'
import sgMail from '@sendgrid/mail'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  if (!process.env.RESEND_API_KEY) {
    console.log('Email would have been sent:')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Text:', text)
    return
  }

  await resend.emails.send({
    from: 'Smart Package <noreply@smartpackage.com>',
    to,
    subject,
    text,
    html,
  })
}

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined')
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendResetPasswordEmail(email: string, resetUrl: string, fullName?: string) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartpackage.com',
    subject: 'إعادة تعيين كلمة المرور - Smart Package',
    html: `
      <h2>إعادة تعيين كلمة المرور</h2>
      
      <p>مرحباً ${fullName || 'عزيزي المستخدم'},</p>
      
      <p>لقد تلقيت هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرور لحسابك في Smart Package.</p>
      
      <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
      
      <a href="${resetUrl}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">إعادة تعيين كلمة المرور</a>
      
      <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
      
      <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
      
      <p>مع أطيب التحيات،<br>فريق Smart Package</p>
    `,
  }

  try {
    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
} 