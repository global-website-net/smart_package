'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  published: boolean
  createdAt: string
  updatedAt: string
  author: {
    fullName: string
    email: string
  }
}

export default function BlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Get user role
      const { data: user } = await supabase
        .from('User')
        .select('role')
        .eq('email', session.user.email)
        .single()

      if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
        router.push('/')
        return
      }

      // Get blog posts with author information
      const { data: blogPosts, error } = await supabase
        .from('blogPost')
        .select(`
          id,
          title,
          content,
          published,
          createdAt,
          updatedAt,
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
        .from('BlogPost')
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>المدونة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => router.push('/blog/new')}>
            إضافة مقال جديد
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>المؤلف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.author.fullName}</TableCell>
                <TableCell>{post.published ? 'منشور' : 'مسودة'}</TableCell>
                <TableCell>{new Date(post.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/blog/edit/${post.id}`)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 