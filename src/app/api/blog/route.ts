import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'

// Get all blogs
export async function GET() {
  try {
    const { data: blogs, error } = await supabase
      .from('BlogPost')
      .select(`
        id,
        title,
        content,
        createdAt,
        itemlink,
        User:authorId (
          id,
          fullName
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) throw error

    const formattedBlogs = (blogs || []).map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.createdAt,
      itemLink: blog.itemlink,
      author: blog.User ? {
        id: blog.User.id,
        name: blog.User.fullName
      } : {
        id: 'unknown',
        name: 'مجهول'
      }
    }))

    return NextResponse.json(formattedBlogs)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المقالات' }, { status: 500 })
  }
}

// Create new blog - only for admin/owner
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

    if (userData.role !== 'ADMIN' && userData.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم إنشاء المدونات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, itemLink } = body

    const { data: blog, error } = await supabase
      .from('BlogPost')
      .insert({
        title,
        content,
        itemlink: itemLink,
        authorId: userData.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating blog:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء المدونة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...blog[0],
      author: userData
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
    const { id, title, content, itemLink } = body

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
        itemlink: itemLink,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        User:authorId (
          id,
          fullName
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

// Delete blog - only for admin/owner
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم حذف المدونات' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المدونة مطلوب' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('BlogPost')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف المدونة' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'تم حذف المدونة بنجاح' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المدونة' },
      { status: 500 }
    )
  }
} 