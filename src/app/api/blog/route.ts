import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const body = await request.json()
    const { title, content, authorId } = body

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: authorId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Only admin and owner can create blogs' },
        { status: 403 }
      )
    }

    const blog = await prisma.blogPost.create({
      data: {
        title,
        content,
        authorId
      }
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}

// Update blog - only for admin/owner
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, authorId } = body

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: authorId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Only admin and owner can update blogs' },
        { status: 403 }
      )
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content
      }
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
} 