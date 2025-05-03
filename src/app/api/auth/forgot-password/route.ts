import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    console.log('Received forgot password request')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { email } = body

    if (!email) {
      console.log('No email provided')
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('Searching for user with email:', email)

    // Check if user exists
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email.toLowerCase().trim())

    console.log('Query result:', { users, userError })

    if (userError) {
      console.error('Error finding user:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('No user found with email:', email)
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    const user = users[0]
    console.log('Found user:', { id: user.id, email: user.email })

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء رمز إعادة التعيين' },
        { status: 500 }
      )
    }

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    const emailBody = `
      مرحباً ${user.fullName},
      
      لقد تلقيت هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرور لحسابك.
      
      انقر على الرابط التالي لإعادة تعيين كلمة المرور:
      ${resetUrl}
      
      إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
      
      هذا الرابط صالح لمدة ساعة واحدة فقط.
      
      مع أطيب التحيات،
      فريق Smart Package
    `

    // TODO: Implement email sending logic here
    // For now, we'll just log the reset URL
    console.log('Reset URL:', resetUrl)

    return NextResponse.json({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
    })
  } catch (error) {
    console.error('Error in forgot password:', error)
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