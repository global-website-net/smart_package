import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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

    const normalizedEmail = email.toLowerCase().trim()
    console.log('Normalized email:', normalizedEmail)

    // Use Supabase's built-in reset password functionality
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })

    if (error) {
      console.error('Error sending reset email:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إرسال بريد إعادة التعيين' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' 
    })
  } catch (error) {
    console.error('Error in forgot password route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// Add GET method to handle redirect
export async function GET() {
  return NextResponse.redirect(new URL('/auth/forgot-password', process.env.NEXT_PUBLIC_APP_URL))
} 