'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إعادة تعيين كلمة المرور')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إعادة تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <p className="text-sm font-medium text-green-800">
              تم إعادة تعيين كلمة المرور بنجاح
            </p>
            <p className="text-sm text-green-700 mt-1">
              سيتم تحويلك إلى صفحة تسجيل الدخول...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password" className="sr-only">
          كلمة المرور الجديدة
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="كلمة المرور الجديدة"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="sr-only">
          تأكيد كلمة المرور
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="تأكيد كلمة المرور"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
        </button>
      </div>

      <div className="text-sm text-center">
        <Link
          href="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </form>
  )
} 