import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/lib/prisma'

// Get all blogs
export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(blogs)
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

    // Check if user is admin or owner
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم إنشاء المدونات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, itemLink } = body

    const blog = await prisma.blogPost.create({
      data: {
        title,
        content,
        itemlink: itemLink,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المدونة' },
      { status: 500 }
    )
  }
}

// Delete blog - only for admin/owner
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'غير مصرح لك - فقط المدير والمالك يمكنهم حذف المدونات' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المدونة' },
      { status: 500 }
    )
  }
} 