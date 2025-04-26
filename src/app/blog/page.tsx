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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const router = useRouter()

  const openDeleteModal = (postId: string) => {
    setPostToDelete(postId)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setPostToDelete(null)
  }

  const handleDelete = async () => {
    if (!postToDelete) return

    try {
      const response = await fetch(`/api/blog/${postToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }

      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postToDelete))
      closeDeleteModal()
    } catch (err) {
      console.error('Error deleting blog post:', err)
      alert('حدث خطأ أثناء حذف المقال')
    }
  }

  const handleEdit = (postId: string) => {
    router.push(`/blog/edit/${postId}`)
  }

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
          authorId: post.author?.id,
          authorName: post.author?.name || 'مجهول',
          authorEmail: post.author?.email || '',
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
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold">{post.title}</h2>
                    {session?.user?.role === 'ADMIN' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => openDeleteModal(post.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-600 mb-4">
                    <p>بواسطة: {post.authorName}</p>
                    <p>تاريخ النشر: {format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: ar })}</p>
                  </div>
                  
                  <div className="prose max-w-none mb-4">
                    <p>{post.content}</p>
                  </div>
                  
                  {post.itemLink && (
                    <div className="mt-4">
                      <a 
                        href={post.itemLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline"
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6 text-center">
              هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 