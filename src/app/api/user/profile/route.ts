import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user profile using Supabase
    const { data: user, error: userError } = await supabase
      .from('User')
      .select(`
        id,
        email,
        fullname,
        role,
        governorate,
        town,
        phoneprefix,
        phonenumber,
        created_at,
        updated_at
      `)
      .eq('id', userId)
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
      fullName: user.fullname,
      role: user.role,
      governorate: user.governorate,
      town: user.town,
      phonePrefix: user.phoneprefix,
      phoneNumber: user.phonenumber,
      createdAt: user.created_at,
      updatedAt: user.updated_at
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
      fullname: fullName,
      governorate,
      town,
      phoneprefix: phonePrefix,
      phonenumber: phoneNumber,
      updated_at: new Date().toISOString()
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
        fullname,
        role,
        governorate,
        town,
        phoneprefix,
        phonenumber,
        created_at,
        updated_at
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
      fullName: updatedUser.fullname,
      role: updatedUser.role,
      governorate: updatedUser.governorate,
      town: updatedUser.town,
      phonePrefix: updatedUser.phoneprefix,
      phoneNumber: updatedUser.phonenumber,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
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