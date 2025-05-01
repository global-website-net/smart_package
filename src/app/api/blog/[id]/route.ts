import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    // Create a new PrismaClient instance for this request
    const post = await prisma.$transaction(async (tx) => {
      return tx.blogPost.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      })
    })

    if (!post) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المقال' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in GET /api/blog/[id]:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المقال' },
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

    // Use transaction for the update operation
    const updatedPost = await prisma.$transaction(async (tx) => {
      return tx.blogPost.update({
        where: { id },
        data: {
          title,
          content,
          itemLink,
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      })
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

export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop();
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف المقال' },
        { status: 401 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    // Use transaction for the delete operation
    await prisma.$transaction(async (tx) => {
      return tx.blogPost.delete({
        where: { id }
      })
    })

    return NextResponse.json({ message: 'تم حذف المقال بنجاح' })
  } catch (error) {
    console.error('Error in DELETE /api/blog/[id]:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المقال' },
      { status: 500 }
    )
  }
} 