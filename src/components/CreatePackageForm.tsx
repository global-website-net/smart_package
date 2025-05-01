'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  fullName: string
  role: string
}

interface CreatePackageFormProps {
  onClose: () => void
}

export default function CreatePackageForm({ onClose }: CreatePackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shops, setShops] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    trackingNumber: '',
    status: 'PENDING',
    shopId: '',
    userId: ''
  })

  useEffect(() => {
    // Fetch shops and users when component mounts
    const fetchUsers = async () => {
      try {
        // Fetch shops (users with SHOP role)
        const shopsResponse = await fetch('/api/shops')
        if (!shopsResponse.ok) {
          throw new Error('Failed to fetch shops')
        }
        const shopsData = await shopsResponse.json()
        setShops(shopsData)

        // Fetch regular users
        const usersResponse = await fetch('/api/users/regular')
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users')
        }
        const usersData = await usersResponse.json()
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('حدث خطأ أثناء جلب البيانات')
      }
    }

    fetchUsers()
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

      onClose()
    } catch (error) {
      console.error('Error creating package:', error)
      setError('حدث خطأ أثناء إنشاء الطرد')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">إنشاء طرد جديد</h2>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">رقم التتبع</label>
            <input
              type="text"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الحالة</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="PENDING">قيد الانتظار</option>
              <option value="PROCESSING">قيد المعالجة</option>
              <option value="SHIPPED">تم الشحن</option>
              <option value="DELIVERED">تم التسليم</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">المتجر</label>
            <select
              name="shopId"
              value={formData.shopId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر المتجر</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">المستخدم</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر المستخدم</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 