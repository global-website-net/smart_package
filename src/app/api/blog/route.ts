export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: blogs, error } = await supabase
      .from('blogPost')
      .select('id, title, content, createdAt, itemlink, User:authorId (id, fullName)')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    const formattedBlogs = (blogs || []).map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.createdAt,
      itemLink: blog.itemlink,
      author: blog.User ? {
        id: blog.User.id,
        name: blog.User.fullName
      } : {
        id: 'unknown',
        name: 'مجهول'
      }
    }));

    return NextResponse.json(formattedBlogs);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المقالات' }, { status: 500 });
  }
}