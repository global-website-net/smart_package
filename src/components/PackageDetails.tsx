'use client'

import { useState } from 'react'

interface Package {
  id: string
  trackingNumber: string
  status: string
  createdAt: Date | string
  updatedAt: Date | string
  user: {
    fullName: string
    email: string | null
  }
  shop: {
    fullName: string
    email: string | null
  } | null
}

interface PackageDetailsProps {
  package: Package
  userRole: string
}

export default function PackageDetails({ package: packageData, userRole }: PackageDetailsProps) {
  const [status, setStatus] = useState(packageData.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/packages/${packageData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedPackage = await response.json()
      setStatus(updatedPackage.status)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار'
      case 'PROCESSING':
        return 'قيد المعالجة'
      case 'SHIPPED':
        return 'تم الشحن'
      case 'DELIVERED':
        return 'تم التسليم'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              تفاصيل الطرد
            </h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  معلومات التتبع
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        رقم التتبع
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {packageData.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        الحالة
                      </p>
                      {(userRole === 'ADMIN' || userRole === 'OWNER') && !isUpdating ? (
                        <select
                          value={status}
                          onChange={(e) => handleStatusUpdate(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="PENDING">قيد الانتظار</option>
                          <option value="PROCESSING">قيد المعالجة</option>
                          <option value="SHIPPED">تم الشحن</option>
                          <option value="DELIVERED">تم التسليم</option>
                          <option value="CANCELLED">ملغي</option>
                        </select>
                      ) : (
                        <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  معلومات العميل
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        الاسم
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {packageData.user.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        البريد الإلكتروني
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {packageData.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {packageData.shop && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    معلومات المتجر
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          الاسم
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {packageData.shop.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          البريد الإلكتروني
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {packageData.shop.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  التواريخ
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        تاريخ الإنشاء
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(packageData.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        آخر تحديث
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(packageData.updatedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 