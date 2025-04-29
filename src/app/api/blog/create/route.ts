import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, itemLink } = await request.json()

    if (!title || !content || !session.user.id) {
      return NextResponse.json(
        { error: 'Title, content, and authorId are required' },
        { status: 400 }
      )
    }

    const currentTime = new Date().toISOString()

    const { data, error } = await supabase
      .from('BlogPost')
      .insert([
        {
          id: uuidv4(),
          title,
          content,
          authorId: session.user.id,
          itemLink,
          createdAt: currentTime,
          updatedAt: currentTime
        }
      ])
      .select()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 