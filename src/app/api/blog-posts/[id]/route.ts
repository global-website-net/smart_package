import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('blogPost')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'تم حذف المقال بنجاح' })
  } catch (error) {
    console.error('Error in DELETE /api/blog-posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    const { title, content, itemlink } = await request.json()
    if (!title || !content || !itemlink) {
      return NextResponse.json(
        { error: 'Title, content, and item link are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: updatedPost, error } = await supabase
      .from('blogPost')
      .update({
        title,
        content,
        itemlink,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        title,
        content,
        authorId,
        createdAt,
        updatedAt,
        itemlink,
        author:authorId (
          fullName,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error in PATCH /api/blog-posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 