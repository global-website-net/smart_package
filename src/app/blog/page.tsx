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
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 10
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

  // Calculate pagination values
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(posts.length / postsPerPage)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
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
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-bold mb-6">بلوج</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/blog/create"
                className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
            <>
              <div className="space-y-8">
                {currentPosts.map((post) => (
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
                          className="text-green-600 hover:text-green-800"
                        >
                          رابط المنتج
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    السابق
                  </button>
                  
                  <span className="text-gray-700">
                    الصفحة {currentPage} من {totalPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    التالي
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
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