import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // First verify the current password if provided
    if (currentPassword) {
      const { data: user, error: userError } = await supabase
        .from('User')
        .select('password')
        .eq('email', session.user.email)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
      }
    }

    // Prepare the update data
    const updateData: any = {
      fullName,
      governorate,
      town,
      phonePrefix,
      phoneNumber,
      updatedAt: new Date().toISOString()
    }

    // Only include new password if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }

    // Update the user profile
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
      console.error('Error updating user:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Transform the response to match the frontend's expected format
    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      governorate: updatedUser.governorate,
      town: updatedUser.town,
      phonePrefix: updatedUser.phonePrefix,
      phoneNumber: updatedUser.phoneNumber,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 