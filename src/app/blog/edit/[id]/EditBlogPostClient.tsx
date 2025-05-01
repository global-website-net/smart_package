'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'

interface BlogPost {
  id: string
  title: string
  content: string
  itemLink?: string
}

interface EditBlogPostClientProps {
  id: string
}

export default function EditBlogPostClient({ id }: EditBlogPostClientProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [itemLink, setItemLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/blog')
      return
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch blog post')
        }
        const data = await response.json()
        setPost(data)
        setTitle(data.title)
        setContent(data.content)
        setItemLink(data.itemLink || '')
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('حدث خطأ أثناء جلب المقال')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchPost()
    }
  }, [status, session, id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          itemLink,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update blog post')
      }

      // Force a cache revalidation and refresh
      router.refresh()
      // Navigate back to blog page
      router.push('/blog')
    } catch (err) {
      console.error('Error updating blog post:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث المقال')
    }
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 text-red-800 p-4 rounded-md text-center">
              {error}
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
            <h1 className="text-3xl font-bold">تعديل المقال</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل عنوان المقال"
                />
              </div>

              <div>
                <label htmlFor="itemLink" className="block text-sm font-medium text-gray-700 mb-1">
                  رابط المنتج
                </label>
                <input
                  type="url"
                  id="itemLink"
                  value={itemLink}
                  onChange={(e) => setItemLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل رابط المنتج (اختياري)"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  محتوى المقال *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل محتوى المقال"
                />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  حفظ التغييرات
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/blog')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 