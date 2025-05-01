import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'رمز إعادة التعيين مطلوب' },
        { status: 400 }
      )
    }

    // Check if token exists and is not expired
    const { data: user, error } = await supabase
      .from('User')
      .select('id, resetTokenExpiry')
      .eq('resetToken', token)
      .single()

    if (error || !user) {
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

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error validating reset token:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من الرابط' },
      { status: 500 }
    )
  }
} 