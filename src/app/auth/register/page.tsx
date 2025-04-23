'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    governorate: '',
    town: ''
  })

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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('كلمات المرور غير متطابقة')
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('User')
        .select('email')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      // Create user in database
      const { data: user, error: createError } = await supabase
        .from('User')
        .insert([
          {
            fullName: formData.fullName,
            email: formData.email,
            password: hashedPassword,
            phoneNumber: formData.phoneNumber,
            governorate: formData.governorate,
            town: formData.town,
            role: 'REGULAR'
          }
        ])
        .select()
        .single()

      if (createError) {
        throw new Error('حدث خطأ أثناء إنشاء الحساب')
      }

      // Redirect to login page
      router.push('/auth/login?registered=true')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">إنشاء حساب جديد</h1>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="الاسم الكامل"
                required
                disabled={isLoading}
              />
            </div>

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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                تأكيد كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="تأكيد كلمة المرور"
                required
                disabled={isLoading}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="رقم الهاتف"
                required
                disabled={isLoading}
              />
            </div>

            {/* Governorate */}
            <div>
              <label htmlFor="governorate" className="block text-gray-700 mb-2">
                المحافظة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="governorate"
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="المحافظة"
                required
                disabled={isLoading}
              />
            </div>

            {/* Town */}
            <div>
              <label htmlFor="town" className="block text-gray-700 mb-2">
                المدينة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="town"
                name="town"
                value={formData.town}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="المدينة"
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
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-green-600 hover:text-green-700"
              >
                لديك حساب بالفعل؟ تسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 