'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewBlogPostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    itemLink: ''
  })

  if (status === 'loading') {
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

  if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OWNER')) {
    router.push('/auth/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const { data: post, error } = await supabase
        .from('blogPost')
        .insert([
          {
            title: formData.title,
            content: formData.content,
            imageUrl: formData.imageUrl,
            itemlink: formData.itemLink,
            authorId: session?.user?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('تم إنشاء المقال بنجاح')
      router.push('/blog')
    } catch (error) {
      console.error('Error creating blog post:', error)
      toast.error('حدث خطأ أثناء إنشاء المقال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">إنشاء مقال جديد</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                عنوان المقال
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان المقال"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                محتوى المقال
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="أدخل محتوى المقال"
                required
                rows={10}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                رابط الصورة
              </label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="أدخل رابط الصورة"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                رابط المنتج (اختياري)
              </label>
              <Input
                type="url"
                value={formData.itemLink}
                onChange={(e) => setFormData({ ...formData, itemLink: e.target.value })}
                placeholder="أدخل رابط المنتج"
              />
            </div>

            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/blog')}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-green-500 text-white hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 