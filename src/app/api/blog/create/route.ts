import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner from database
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ في التحقق من الصلاحيات' },
        { status: 500 }
      )
    }

    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم إنشاء المدونات' },
        { status: 403 }
      )
    }

    const { title, content, itemLink } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    const currentTime = new Date().toISOString()

    const { data, error } = await supabase
      .from('BlogPost')
      .insert([
        {
          id: uuidv4(),
          title,
          content,
          authorId: userData.id,
          published: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          itemLink
        }
      ])
      .select()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء المقال' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
} 