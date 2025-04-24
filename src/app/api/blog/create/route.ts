import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
      return NextResponse.json({ error: 'حدث خطأ في التحقق من الصلاحيات' }, { status: 500 })
    }

    if (userData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
    }

    const { title, content, authorId, itemLink } = await request.json()

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('BlogPost')
      .insert([
        {
          id: uuidv4(),
          title,
          content,
          authorId,
          itemLink,
          createdAt: new Date().toISOString(),
        },
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
    console.error('Error in blog creation API:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 