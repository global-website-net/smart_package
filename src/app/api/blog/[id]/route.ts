import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    
    const post = await prisma.blogPost.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in GET /api/blog/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const id = request.url.split('/').pop();
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل المقال' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, itemLink } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'عنوان المقال والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        itemlink: itemLink,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error in PUT /api/blog/[id]:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المقال' },
      { status: 500 }
    )
  }
} 