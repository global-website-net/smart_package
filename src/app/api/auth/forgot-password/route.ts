import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

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
      .select('id, email')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token expires in 1 hour

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user with reset token:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء رمز إعادة التعيين' },
        { status: 500 }
      )
    }

    // Send reset password email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    
    // TODO: Implement email sending functionality
    // For now, we'll just log the reset link
    console.log('Password reset link:', resetLink)

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