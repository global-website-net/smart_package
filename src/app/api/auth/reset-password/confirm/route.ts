import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Find user with reset token
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, resetToken, resetTokenExpiry')
      .eq('resetToken', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'رابط إعادة تعيين كلمة المرور غير صالح' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json(
        { error: 'رابط إعادة تعيين كلمة المرور منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث كلمة المرور' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
    })
  } catch (error) {
    console.error('Error in password reset confirmation:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
} 