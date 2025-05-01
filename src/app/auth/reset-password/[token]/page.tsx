'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../../components/Header'

export default function ResetPasswordForm({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Check if token is valid
    const checkToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password/${params.token}`)
        if (!response.ok) {
          setTokenValid(false)
        }
      } catch (error) {
        setTokenValid(false)
      }
    }
    checkToken()
  }, [params.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/auth/reset-password/${params.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور')
      }

      setSuccess(true)
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-20">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                رابط غير صالح
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية
              </p>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  العودة إلى صفحة تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              إعادة تعيين كلمة المرور
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              أدخل كلمة المرور الجديدة
            </p>
          </div>

          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700 text-center">
                تم إعادة تعيين كلمة المرور بنجاح
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  سيتم توجيهك إلى صفحة تسجيل الدخول...
                </p>
              </div>
            </div>
          ) : (
            <form 
              className="mt-8 space-y-6" 
              onSubmit={handleSubmit}
              method="post"
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="password" className="sr-only">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="كلمة المرور الجديدة"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {loading ? 'جاري إعادة تعيين كلمة المرور...' : 'إعادة تعيين كلمة المرور'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 