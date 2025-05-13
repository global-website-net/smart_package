'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  author: {
    fullName: string | null
    email: string | null
  } | null
  itemlink: string
}

export default function BlogPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    itemLink: ''
  })

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
        setPosts(posts.map(post => ({
          ...post,
          author: post.author || {
            fullName: 'مجهول',
            email: null
          }
        })) as unknown as BlogPost[])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('حدث خطأ أثناء جلب المقالات')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete post')
      }

      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postId))
      setPostToDelete(null)
      toast.success('تم حذف المقال بنجاح')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المقال')
    }
  }

  const handleEditPost = async (postId: string) => {
    try {
      console.log('Updating post with data:', editFormData)
      
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editFormData.title,
          content: editFormData.content,
          itemLink: editFormData.itemLink
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update post')
      }

      const updatedPost = await response.json()
      console.log('Updated post:', updatedPost)
      
      // Update the posts array with the new post data
      setPosts(posts.map(post => 
        post.id === postId ? {
          ...post,
          title: updatedPost.title,
          content: updatedPost.content,
          itemlink: updatedPost.itemlink,
          updatedAt: updatedPost.updatedAt
        } : post
      ))
      
      setEditingPost(null)
      toast.success('تم تحديث المقال بنجاح')
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المقال')
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
              <div className="relative w-24 sm:w-32 md:w-40">
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

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-white rounded-lg shadow-md">
                <CardHeader>
                  <div className="mb-2">
                    <span className="text-lg font-bold text-black">العنوان:</span>
                  </div>
                  <CardTitle className="text-base font-normal text-gray-700">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-bold text-black mb-3">المحتوى:</h3>
                    <p className="text-base font-normal text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {post.itemlink && (
                    <div className="mt-4">
                      <a
                        href={post.itemlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        عرض المنتج
                      </a>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="text-lg font-bold text-black mb-1">تاريخ الإنشاء:</div>
                    <div className="text-base font-normal text-gray-700">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </div>
                  </div>
                  {isAdminOrOwner && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex gap-4 rtl:space-x-reverse">
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                          حذف
                        </button>
                        <button
                          onClick={() => {
                            setEditingPost(post)
                            setEditFormData({
                              title: post.title,
                              content: post.content,
                              itemLink: post.itemlink
                            })
                          }}
                          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                          تعديل
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Modal */}
          {editingPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">تعديل المقال</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">العنوان</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">المحتوى</label>
                    <textarea
                      value={editFormData.content}
                      onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">رابط المنتج</label>
                    <input
                      type="text"
                      value={editFormData.itemLink}
                      onChange={(e) => setEditFormData({ ...editFormData, itemLink: e.target.value })}
                      className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="flex justify-center items-center mt-6">
                    <div className="flex gap-4 rtl:space-x-reverse">
                      <button
                        onClick={() => setEditingPost(null)}
                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleEditPost(editingPost.id)}
                        className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {postToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
                <p className="text-gray-600 mb-6">
                  هل أنت متأكد من رغبتك في حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-6 gap-4">
                  <button
                    onClick={() => setPostToDelete(null)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      handleDeletePost(postToDelete.id)
                      setPostToDelete(null)
                    }}
                    className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 