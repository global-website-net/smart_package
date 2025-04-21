'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

export default function CreateBlogPost() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    coverImage: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement blog post creation
    alert('سيتم تنفيذ إنشاء المقال قريباً')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">إنشاء مقال جديد</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-gray-700 mb-2">
                عنوان المقال <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="عنوان المقال"
                required
              />
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-gray-700 mb-2">
                ملخص المقال <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ملخص قصير للمقال"
                required
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label htmlFor="coverImage" className="block text-gray-700 mb-2">
                رابط صورة الغلاف <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-gray-700 mb-2">
                محتوى المقال <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[300px]"
                placeholder="اكتب محتوى المقال هنا..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                نشر المقال
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 