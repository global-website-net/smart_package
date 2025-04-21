'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../components/Header'

export default function Profile() {
  const [user] = useState({
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية'
  })
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">الملف الشخصي</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>
          
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                <Image
                  src="/images/profile-placeholder.svg"
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">معلومات الحساب</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input
                  type="text"
                  value={user.name}
                  readOnly
                  className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={user.phone}
                  readOnly
                  className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={user.address}
                  readOnly
                  className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                />
              </div>
              
              <div className="pt-4 text-center">
                <button className="bg-green-500 text-white px-12 py-3 rounded-full hover:bg-green-600 transition-colors">
                  تعديل الملف الشخصي
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 