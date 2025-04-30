import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();
    
    const { data, error } = await supabase
      .from('BlogPost')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
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

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, itemLink } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('BlogPost')
      .update({
        title,
        content,
        itemLink,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/blog/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop();
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('BlogPost')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/blog/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 