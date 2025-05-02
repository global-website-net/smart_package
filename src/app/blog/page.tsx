'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BlogPost {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  itemLink: string
  author: {
    fullName: string
    email: string
  }
}

export default function BlogPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchPosts()
    }
  }, [status, session])

  const fetchPosts = async () => {
    try {
      setLoading(true)

      // Get blog posts with author information
      const { data: blogPosts, error } = await supabase
        .from('blogPost')
        .select(`
          id,
          title,
          content,
          createdAt,
          updatedAt,
          itemLink,
          author:User (
            fullName,
            email
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform the data to match the BlogPost interface
      const transformedPosts = (blogPosts || []).map(post => ({
        ...post,
        author: post.author[0] // Take the first author since it's an array
      }))

      setPosts(transformedPosts)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      toast.error('حدث خطأ أثناء جلب المقالات')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blogPost')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('تم حذف المقال بنجاح')
      fetchPosts()
    } catch (error) {
      console.error('Error deleting blog post:', error)
      toast.error('حدث خطأ أثناء حذف المقال')
    }
  }

  if (loading) {
    return <div>جاري التحميل...</div>
  }

  const isAdminOrOwner = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">المدونة</h1>
        {isAdminOrOwner && (
          <Button onClick={() => router.push('/blog/create')}>
            إنشاء مقال جديد
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    كتب بواسطة: {post.author.fullName}
                  </div>
                  {isAdminOrOwner && (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/blog/${post.id}/edit`)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(post.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 