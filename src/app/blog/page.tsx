'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  author: {
    fullName: string
    email: string
  }
  itemlink: string
}

export default function BlogPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchPosts()
    }
  }, [status])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: posts, error } = await supabase
        .from('blogPost')
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
        .order('createdAt', { ascending: false })

      if (error) throw error

      if (posts) {
        setPosts(posts as unknown as BlogPost[])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('حدث خطأ أثناء جلب المقالات')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
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

  const isAdminOrOwner = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">بلوج</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {isAdminOrOwner && (
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/blog/create')}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  إنشاء مقال جديد
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد مقالات حتى الآن</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex flex-col space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <a 
                          href={post.itemlink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 truncate"
                        >
                          {post.itemlink}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 