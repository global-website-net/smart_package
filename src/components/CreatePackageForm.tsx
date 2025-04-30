'use client'

import { useState, useEffect } from 'react'

interface Shop {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
}

interface FormData {
  trackingNumber: string
  status: string
  shopId: string
  currentLocation: string
  userId: string
}

export default function CreatePackageForm({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    trackingNumber: '',
    status: 'PENDING',
    shopId: '',
    currentLocation: 'المستودع الرئيسي',
    userId: ''
  })

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      setError('حدث خطأ في جلب المتاجر')
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/users/regular')
        if (!usersResponse.ok) {
          const errorData = await usersResponse.json()
          throw new Error(errorData.error || 'Failed to fetch users')
        }
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'حدث خطأ أثناء جلب البيانات')
      }
    }

    fetchData()
  }, [])

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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create package')
      }

      // Reset form and close modal
      setFormData({
        trackingNumber: '',
        status: 'PENDING',
        shopId: '',
        currentLocation: 'المستودع الرئيسي',
        userId: ''
      })
      setIsOpen(false)
      window.location.reload() // Refresh the page to show new package
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الشحنة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">إضافة شحنة جديدة</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <select
              id="shopId"
              name="shopId"
              value={formData.shopId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">اختر المتجر</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              حساب المستخدم
            </label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">اختر المستخدم</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center space-x-6 rtl:space-x-reverse gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-100 bg-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 