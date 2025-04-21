'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    governorate: '',
    town: '',
    phonePrefix: '+970',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })

  const governorates = [
    'محافظة قلقيلية',
    'محافظة نابلس',
    'محافظة طولكرم',
    'محافظة طوباس',
    'محافظة جنين',
    'محافظة القدس',
    'محافظة سلفيت',
    'محافظة بيت لحم',
    'محافظة الخليل',
    'محافظة اريحا',
    'محافظة رام الله والبيرة'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('كلمات المرور غير متطابقة')
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          governorate: formData.governorate,
          town: formData.town,
          phonePrefix: formData.phonePrefix,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'حدث خطأ أثناء إنشاء الحساب')
        return
      }

      alert('تم إنشاء الحساب بنجاح')
      // Redirect to login page or dashboard
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء إنشاء الحساب')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">إنشاء حساب جديد</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
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
              />
            </div>

            {/* Governorate */}
            <div>
              <label htmlFor="governorate" className="block text-gray-700 mb-2">
                المحافظة <span className="text-red-500">*</span>
              </label>
              <select
                id="governorate"
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">المحافظة</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* Town */}
            <div>
              <label htmlFor="town" className="block text-gray-700 mb-2">
                البلدة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="town"
                name="town"
                value={formData.town}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="البلدة"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="رقم الهاتف"
                  required
                />
                <select
                  name="phonePrefix"
                  value={formData.phonePrefix}
                  onChange={handleChange}
                  className="w-24 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="+970">+970</option>
                  <option value="+972">+972</option>
                </select>
              </div>
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
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                إنشاء الحساب
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" className="text-green-500 hover:text-green-600">
                تسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 