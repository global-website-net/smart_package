'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Header from '../components/Header'

interface BlogPost {
  id: string
  title: string
  subtitle: string
  content: string
  imageUrl?: string
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isAdmin, setIsAdmin] = useState(false) // This will be set based on user role

  useEffect(() => {
    // Fetch blogs and user role
    // This will be implemented when we set up authentication
  }, [])

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

          {/* Blog Posts */}
          <div className="space-y-12">
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
                  <h3 className="text-xl font-semibold mb-4">{blog.title}</h3>
                  <p className="text-gray-600 mb-4">{blog.subtitle}</p>
                  <p className="text-gray-700">{blog.content}</p>
                </div>
              </div>
            ))}

            {/* Placeholder Content */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="w-full h-64 bg-gray-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">كتابة لتعبأة الصفحة</h3>
                <p className="text-gray-600 mb-4">كتابة لتعبأة الصفحة</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="w-full h-64 bg-gray-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">كتابة لتعبأة الصفحة</h3>
                <p className="text-gray-600 mb-4">كتابة لتعبأة الصفحة</p>
              </div>
            </div>
          </div>

          {/* Add Blog Button - Only visible to admin/owner */}
          {isAdmin && (
            <div className="mt-8 text-center">
              <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition-colors">
                Call To Action
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 