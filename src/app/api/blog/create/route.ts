import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, authorId } = await request.json()

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: 'Title, content, and authorId are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('BlogPost')
      .insert([
        {
          id: uuidv4(),
          title,
          content,
          authorId,
          createdAt: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 