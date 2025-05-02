'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Header } from '@/components/Header'

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-6">المدونة</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-64 md:w-80">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {isAdminOrOwner && (
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => router.push('/blog/create')}
                  className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
                >
                  إنشاء مقال جديد
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="text-sm text-gray-500">
                    كتب بواسطة: {post.author.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 