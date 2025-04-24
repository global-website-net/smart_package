'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

interface BlogPost {
  id: string
  title: string
  subtitle: string
  content: string
  imageUrl?: string
  authorId: string
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blog')
        if (!response.ok) {
          throw new Error('Failed to fetch blogs')
        }
        const data = await response.json()
        setBlogs(data)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      }
    }

    const checkAdminStatus = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            setIsAdmin(data.role === 'ADMIN' || data.role === 'OWNER')
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
    }

    fetchBlogs()
    checkAdminStatus()
  }, [status, session])

  const handleDelete = async (blogId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog')
      }

      setBlogs(blogs.filter(blog => blog.id !== blogId))
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('حدث خطأ أثناء حذف المقال')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">بلوج</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            <h2 className="text-xl mt-6">شرح قصير عن البلوج</h2>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => router.push('/blog/create')}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                إضافة مقال جديد
              </button>
            </div>
          )}

          {/* Blog Posts */}
          <div className="space-y-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {blog.imageUrl && (
                  <div className="w-full h-64 bg-gray-600 relative">
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{blog.title}</h3>
                    {isAdmin && (
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => router.push(`/blog/edit/${blog.id}`)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{blog.subtitle}</p>
                  <p className="text-gray-700">{blog.content}</p>
                </div>
              </div>
            ))}

            {blogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">لا توجد مقالات حالياً</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 