import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@prisma/client'

// Initialize Supabase admin client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
    const { email, password, fullName, governorate, town, phonePrefix, phoneNumber } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !governorate || !town || !phonePrefix || !phoneNumber) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if user exists in Supabase auth
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = users?.users?.find(user => user.email === email)

    if (existingAuthUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Create user in Supabase auth first
    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: UserRole.REGULAR,
        governorate,
        town,
        phone_prefix: phonePrefix,
        phone_number: phoneNumber
      }
    })

    if (createAuthError || !authUser?.user) {
      console.error('Error creating auth user:', createAuthError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب في نظام المصادقة' },
        { status: 500 }
      )
    }

    try {
      // Create user in database using the admin client
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('User')
        .insert({
          id: authUser.user.id,
          email,
          fullName,
          role: UserRole.REGULAR,
          governorate,
          town,
          phonePrefix,
          phoneNumber,
          updatedAt: new Date().toISOString(),
          password: null  // Explicitly set password to null
        })
        .select()
        .single()

      if (dbError) {
        // If database user creation fails, delete the auth user
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        console.error('Error creating database user:', dbError)
        return NextResponse.json(
          { error: 'حدث خطأ أثناء إنشاء الحساب في قاعدة البيانات' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        user: dbUser
      })
    } catch (dbError) {
      // If database user creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      console.error('Error creating database user:', dbError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب في قاعدة البيانات' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in signup:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
} 