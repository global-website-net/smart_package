import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    // Create blog post in Supabase
    const { data: blog, error } = await supabase
      .from('BlogPost')
      .insert([
        {
          title,
          content,
          author_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating blog:', error)
      return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المقال' }, { status: 500 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error in blog creation:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المقال' },
      { status: 500 }
    )
  }
} 