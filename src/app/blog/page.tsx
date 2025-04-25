'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface BlogPost {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorEmail: string
  createdAt: string
  itemLink?: string
}

export default function BlogPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }
        const data = await response.json()
        
        // Transform the data to match the BlogPost interface
        const transformedPosts = data.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          authorId: post.author?.[0]?.id,
          authorName: post.author?.[0]?.name || 'مجهول',
          authorEmail: post.author?.[0]?.email || 'مجهول',
          createdAt: post.createdAt,
          itemLink: post.itemLink
        }))
        
        setPosts(transformedPosts)
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('حدث خطأ أثناء جلب المقالات')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchPosts()
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">المدونة</h1>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/blog/create"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                إضافة مقال جديد
              </Link>
            )}
          </div>
          
          {error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-md text-center">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">لا توجد مقالات متاحة حالياً</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold mb-4">{post.title}</h2>
                  <div className="text-gray-600 mb-4">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-400">{post.authorEmail}</span>
                    <span className="mx-2">•</span>
                    <span>{format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: ar })}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  {post.itemLink && (
                    <div className="mt-4">
                      <a
                        href={post.itemLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        رابط المنتج
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 