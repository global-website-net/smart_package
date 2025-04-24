'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  content: string
  createdAt: string
  user: {
    name: string
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user role and posts in parallel
        const [roleResponse, postsResponse] = await Promise.all([
          fetch('/api/user/role'),
          fetch('/api/blog')
        ])

        if (!roleResponse.ok || !postsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const roleData = await roleResponse.json()
        const postsData = await postsResponse.json()

        setIsAdmin(roleData.role === 'ADMIN' || roleData.role === 'OWNER')
        setPosts(postsData.posts)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">المدونة</h1>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">المدونة</h1>
          
          {isAdmin && (
            <div className="mb-8">
              <Link
                href="/blog/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                إضافة مقال جديد
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>بواسطة: {post.user.name}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 