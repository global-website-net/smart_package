'use client'

import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUser className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
              <p className="text-gray-500">معلومات المستخدم</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaUser className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">الاسم</p>
                <p className="text-gray-900">اسم المستخدم</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="text-gray-900">user@example.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaPhone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">رقم الهاتف</p>
                <p className="text-gray-900">+1234567890</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">العنوان</p>
                <p className="text-gray-900">العنوان الكامل</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              تعديل الملف الشخصي
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 