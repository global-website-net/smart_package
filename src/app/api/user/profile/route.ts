import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    // Get user profile using Supabase with email
    const { data: user, error: userError } = await supabase
      .from('User')
      .select(`
        id,
        email,
        fullName,
        role,
        governorate,
        town,
        phonePrefix,
        phoneNumber,
        createdAt,
        updatedAt
      `)
      .eq('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user profile:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب بيانات المستخدم' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Transform the response to match the frontend's expected format
    const transformedUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      governorate: user.governorate,
      town: user.town,
      phonePrefix: user.phonePrefix,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات المستخدم' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      fullName, 
      governorate, 
      town, 
      phonePrefix, 
      phoneNumber, 
      currentPassword,
      newPassword 
    } = body

    // First get the user to verify they exist and get their current password
    const { data: existingUser, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (userError || !existingUser) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Prepare the update data
    const updateData: any = {
      fullName,
      phonePrefix,
      phoneNumber,
      updatedAt: new Date().toISOString()
    }

    // Only include governorate and town for regular users
    if (existingUser.role === 'REGULAR') {
      updateData.governorate = governorate
      updateData.town = town
    }

    // Verify current password
    if (currentPassword) {
      try {
        // Check if user has a password set
        if (!existingUser.password) {
          // If user doesn't have a password set, allow the update without password verification
          // This handles cases where users signed up with social auth
          if (newPassword) {
            // If they're setting a new password, hash and save it
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            updateData.password = hashedPassword
          }
        } else {
          // If user has a password set, verify it
          if (typeof currentPassword !== 'string' || typeof existingUser.password !== 'string') {
            return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
          }

          const isValid = await bcrypt.compare(currentPassword, existingUser.password)
          if (!isValid) {
            return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
          }

          // If password is valid and new password is provided, update it
          if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            updateData.password = hashedPassword
          }
        }
      } catch (error) {
        console.error('Password comparison error:', error)
        return NextResponse.json({ error: 'حدث خطأ في التحقق من كلمة المرور' }, { status: 500 })
      }
    }

    // Update the user profile in the database
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update(updateData)
      .eq('email', session.user.email)
      .select(`
        id,
        email,
        fullName,
        role,
        governorate,
        town,
        phonePrefix,
        phoneNumber,
        createdAt,
        updatedAt
      `)
      .single()

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الملف الشخصي' }, { status: 500 })
    }

    // Update user metadata in Supabase Auth
    try {
      // Update user metadata
      const { data: { user: authUser }, error: authUpdateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            full_name: updateData.fullName,
            governorate: updateData.governorate,
            town: updateData.town,
            phone_prefix: updateData.phonePrefix,
            phone_number: updateData.phoneNumber
          }
        }
      )

      if (authUpdateError) {
        console.error('Error updating auth user metadata:', authUpdateError)
        // Don't return error here, just log it since the database update was successful
      }

      // If password was changed, update it in auth as well
      if (newPassword) {
        const { error: passwordUpdateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: newPassword
          }
        )

        if (passwordUpdateError) {
          console.error('Error updating auth password:', passwordUpdateError)
        }
      }
    } catch (error) {
      console.error('Error updating auth metadata:', error)
      // Don't return error here, just log it since the database update was successful
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الملف الشخصي' },
      { status: 500 }
    )
  }
} 