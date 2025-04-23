'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/'
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(redirectPath)
      }
    }
    checkSession()
  }, [router, redirectPath])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.user) {
        // Get user role from our database
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('email', formData.email)
          .single()

        if (userError) {
          setError('حدث خطأ أثناء جلب بيانات المستخدم')
          return
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: userData.id,
          email: userData.email,
          name: userData.fullName,
          role: userData.role
        }))

        // Redirect to the intended page or home
        router.push(redirectPath)
        router.refresh() // Refresh the page to update the session
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-gray-700 mb-2">
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="البريد الإلكتروني"
          required
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-gray-700 mb-2">
          كلمة المرور <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="كلمة المرور"
          required
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <Link
          href="/auth/register"
          className="text-green-600 hover:text-green-700"
        >
          إنشاء حساب جديد
        </Link>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">تسجيل الدخول</h1>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 