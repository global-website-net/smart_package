import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get all blogs
export async function GET() {
  try {
    const { data: blogs, error } = await supabase
      .from('BlogPost')
      .select(`
        *,
        User:authorId (
          fullName,
          email
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching blogs:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المدونات' },
        { status: 500 }
      )
    }

    return NextResponse.json(blogs?.map(blog => ({
      ...blog,
      author: blog.User
    })))
  } catch (error) {
    console.error('Error in GET /api/blog:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المدونات' },
      { status: 500 }
    )
  }
}

// Create new blog - only for admin/owner
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content } = body

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم إنشاء المدونات' },
        { status: 403 }
      )
    }

    const { data: blog, error } = await supabase
      .from('BlogPost')
      .insert({
        title,
        content,
        user_id: session.user.id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select(`
        *,
        User:user_id (
          fullName,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating blog:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء المدونة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...blog,
      author: blog.User
    })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المدونة' },
      { status: 500 }
    )
  }
}

// Update blog - only for admin/owner
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, title, content } = body

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم تحديث المدونات' },
        { status: 403 }
      )
    }

    const { data: blog, error } = await supabase
      .from('BlogPost')
      .update({
        title,
        content,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select(`
        *,
        User:authorId (
          fullName,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error updating blog:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث المدونة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...blog,
      author: blog.User
    })
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المدونة' },
      { status: 500 }
    )
  }
} 