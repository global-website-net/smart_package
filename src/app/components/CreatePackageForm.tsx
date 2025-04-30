'use client'

import { useState } from 'react'

interface CreatePackageFormProps {
  onPackageCreated: () => void
}

export default function CreatePackageForm({ onPackageCreated }: CreatePackageFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    trackingNumber: '',
    status: 'PENDING',
    shopId: '',
    currentLocation: '',
    userId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/packages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create package')
      }

      // Reset form and close modal
      setFormData({
        trackingNumber: '',
        status: 'PENDING',
        shopId: '',
        currentLocation: '',
        userId: ''
      })
      setIsOpen(false)
      onPackageCreated()
    } catch (error) {
      setError('حدث خطأ أثناء إنشاء الشحنة')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-4"
      >
        إضافة شحنة جديدة
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">إضافة شحنة جديدة</h2>
            
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم التتبع
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="PROCESSING">قيد المعالجة</option>
                  <option value="SHIPPED">تم الشحن</option>
                  <option value="DELIVERED">تم التسليم</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
              </div>

              <div>
                <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 mb-1">
                  المتجر
                </label>
                <input
                  type="text"
                  id="shopId"
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  الموقع الحالي
                </label>
                <input
                  type="text"
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  معرف المستخدم
                </label>
                <input
                  type="text"
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 