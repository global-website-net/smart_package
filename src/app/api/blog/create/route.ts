import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner using session role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
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

    const { data, error } = await supabaseAdmin
      .from('blogPost')
      .insert([
        {
          id: uuidv4(),
          title,
          content,
          itemLink: itemLink,
          authorId: session.user.id,
          createdAt: currentTime,
          updatedAt: currentTime
        }
      ])
      .select()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء المدونة' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in blog creation:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المدونة' },
      { status: 500 }
    )
  }
} 