import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Get all blogs
export async function GET() {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT 
          bp.*,
          u."fullName" as "authorName",
          u.email as "authorEmail"
        FROM "BlogPost" bp
        LEFT JOIN "User" u ON bp."authorId" = u.id
        ORDER BY bp."createdAt" DESC
      `)

      const blogs = result.rows.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        author: {
          id: blog.authorId,
          fullName: blog.authorName,
          email: blog.authorEmail
        }
      }))

      return NextResponse.json(blogs)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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