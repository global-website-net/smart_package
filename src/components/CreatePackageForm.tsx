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
    currentLocation: '',
    userId: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shops
        const shopsResponse = await fetch('/api/shops')
        if (!shopsResponse.ok) {
          throw new Error('Failed to fetch shops')
        }
        const shopsData = await shopsResponse.json()
        setShops(shopsData.shops || [])

        // Fetch users
        const usersResponse = await fetch('/api/users/regular')
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users')
        }
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('حدث خطأ أثناء جلب البيانات')
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
      window.location.reload() // Refresh the page to show new package
    } catch (error) {
      setError('حدث خطأ أثناء إنشاء الشحنة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        إضافة شحنة جديدة
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">إضافة شحنة جديدة</h2>
            
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر المتجر</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
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
                  المستخدم
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر المستخدم</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-16 rtl:space-x-reverse">
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