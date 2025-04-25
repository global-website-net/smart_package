import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface BlogPost {
  id: string
  title: string
  content: string
  createdAt: string
  itemLink: string
  User: {
    id: string
    fullName: string
  }[]
}

// Get all blogs
export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('BlogPost')
      .select(`
        id,
        title,
        content,
        createdAt,
        itemLink,
        User (
          id,
          fullName
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching blogs:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المقالات' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      itemLink: post.itemLink,
      author: post.User?.[0] ? {
        name: post.User[0].fullName
      } : {
        name: 'مجهول'
      }
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error('Error in blog route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المقالات' },
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