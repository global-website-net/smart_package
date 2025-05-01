import { Resend } from 'resend'

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