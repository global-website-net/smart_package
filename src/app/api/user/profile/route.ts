import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
      .select('*')
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

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
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
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const updates = await request.json()

    // Update user profile using Supabase
    const { data: user, error: userError } = await supabase
      .from('User')
      .update({
        ...updates,
        updatedAt: new Date()
      })
      .eq('id', userId)
      .select()
      .single()

    if (userError) {
      console.error('Error updating user profile:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث بيانات المستخدم' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث بيانات المستخدم' },
      { status: 500 }
    )
  }
} 