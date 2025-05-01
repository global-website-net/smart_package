import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

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
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'رمز إعادة التعيين وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Check if token exists and is not expired
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, resetTokenExpiry')
      .eq('resetToken', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'رابط إعادة تعيين كلمة المرور غير صالح' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const expiryDate = new Date(user.resetTokenExpiry)
    if (expiryDate < new Date()) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط إعادة تعيين كلمة المرور' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password and clear reset token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'تم إعادة تعيين كلمة المرور بنجاح'
    })
  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    )
  }
} 