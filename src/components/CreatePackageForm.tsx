'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  fullName: string
  role: string
}

interface CreatePackageFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface PackageFormData {
  trackingNumber: string
  orderNumber: string
  userId: string
  shopId: string
  currentLocation?: string
  notes?: string
}

export default function CreatePackageForm({ onSuccess, onCancel }: CreatePackageFormProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    trackingNumber: '',
    orderNumber: '',
    userId: '',
    shopId: '',
    currentLocation: '',
    notes: ''
  })
  const [users, setUsers] = useState<{ id: string; fullName: string }[]>([])
  const [shops, setShops] = useState<{ id: string; fullName: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch shops and users when component mounts
    const fetchUsers = async () => {
      try {
        // Fetch shops (users with SHOP role)
        const shopsResponse = await fetch('/api/users/shops')
        if (!shopsResponse.ok) {
          throw new Error('Failed to fetch shops')
        }
        const shopsData = await shopsResponse.json()
        console.log('Fetched shops:', shopsData)
        setShops(shopsData)

        // Fetch regular users
        const usersResponse = await fetch('/api/users/regular')
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch regular users')
        }
        const usersData = await usersResponse.json()
        console.log('Fetched regular users:', usersData)
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
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create package')
      }

      toast.success('تم إنشاء الطرد بنجاح')
      onSuccess()
    } catch (err) {
      console.error('Error creating package:', err)
      setError('حدث خطأ أثناء إنشاء الطرد')
    } finally {
      setIsSubmitting(false)
    }
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
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">رقم التتبع</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">رقم الطلب</label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">المستخدم</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">اختر المستخدم</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">المتجر</label>
              <select
                value={formData.shopId}
                onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">اختر المتجر</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">الموقع الحالي</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-center space-x-8 rtl:space-x-reverse mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 