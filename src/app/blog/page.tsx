'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string
  }
}

export default function BlogPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/login')
        return
      }

      if (status === 'authenticated' && session?.user?.email) {
        try {
          // Check if user is admin
          const { data: user, error: userError } = await supabase
            .from('User')
            .select('role')
            .eq('email', session.user.email)
            .single()

          if (userError) {
            console.error('Error checking user role:', userError)
            setError('حدث خطأ أثناء التحقق من الصلاحيات')
            return
          }

          if (user && (user.role === 'ADMIN' || user.role === 'OWNER')) {
            setIsAdmin(true)
          }

          // Fetch blog posts
          const { data: blogPosts, error: postsError } = await supabase
            .from('BlogPost')
            .select(`
              id,
              title,
              content,
              createdAt,
              author:User (
                name
              )
            `)
            .order('createdAt', { ascending: false })

          if (postsError) {
            throw postsError
          }

          setPosts(blogPosts || [])
        } catch (error) {
          console.error('Error:', error)
          setError('حدث خطأ أثناء جلب المقالات')
        } finally {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [status, session, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-gray-600">جاري تحميل المقالات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">المدونة</h1>
            {isAdmin && (
              <button
                onClick={() => router.push('/blog/create')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                إضافة مقال جديد
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">لا توجد مقالات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{post.author.name}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('ar-SA')}</span>
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