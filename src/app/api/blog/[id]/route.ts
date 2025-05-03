import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database with case-insensitive email match using admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id, role')
      .ilike('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    if (!user) {
      console.error('User not found for email:', session.user.email)
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول' },
        { status: 404 }
      )
    }

    // Get blog post using admin client
    const { data: blogPost, error: blogError } = await supabaseAdmin
      .from('blogPost')
      .select(`
        id,
        title,
        content,
        authorId,
        createdAt,
        updatedAt,
        itemlink,
        author:User (
          fullName,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (blogError) {
      console.error('Error fetching blog post:', blogError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المقال' },
        { status: 500 }
      )
    }

    if (!blogPost) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المقال' },
        { status: 404 }
      )
    }

    return NextResponse.json(blogPost)
  } catch (error) {
    console.error('Error in get blog post route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database with case-insensitive email match using admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id, role')
      .ilike('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    if (!user) {
      console.error('User not found for email:', session.user.email)
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول' },
        { status: 404 }
      )
    }

    // Get blog post using admin client
    const { data: blogPost, error: blogError } = await supabaseAdmin
      .from('blogPost')
      .select('authorId')
      .eq('id', id)
      .single()

    if (blogError) {
      console.error('Error fetching blog post:', blogError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المقال' },
        { status: 500 }
      )
    }

    if (!blogPost) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المقال' },
        { status: 404 }
      )
    }

    // Check if user is authorized to update the blog post
    if (user.role !== 'ADMIN' && user.role !== 'OWNER' && blogPost.authorId !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتحديث هذا المقال' },
        { status: 403 }
      )
    }

    const { title, content, itemLink } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    const { data: updatedBlogPost, error: updateError } = await supabaseAdmin
      .from('blogPost')
      .update({
        title,
        content,
        itemlink: itemLink,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating blog post:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث المقال' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedBlogPost)
  } catch (error) {
    console.error('Error in update blog post route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request)
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Get user from database with case-insensitive email match using admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id, role')
      .ilike('email', session.user.email)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    if (!user) {
      console.error('User not found for email:', session.user.email)
      return NextResponse.json(
        { error: 'لم يتم العثور على المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول' },
        { status: 404 }
      )
    }

    // Get blog post using admin client
    const { data: blogPost, error: blogError } = await supabaseAdmin
      .from('blogPost')
      .select('authorId')
      .eq('id', id)
      .single()

    if (blogError) {
      console.error('Error fetching blog post:', blogError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب المقال' },
        { status: 500 }
      )
    }

    if (!blogPost) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المقال' },
        { status: 404 }
      )
    }

    // Check if user is authorized to delete the blog post
    if (user.role !== 'ADMIN' && user.role !== 'OWNER' && blogPost.authorId !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف هذا المقال' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabaseAdmin
      .from('blogPost')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting blog post:', deleteError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حذف المقال' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete blog post route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
} 