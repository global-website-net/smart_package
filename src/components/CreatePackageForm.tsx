'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  fullName: string
  role: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    name: string
    email: string
  }
}

interface CreatePackageFormProps {
  onSuccess: (newPackage: any) => void
  onCancel: () => void
  orders: Order[]
}

interface PackageFormData {
  orderNumber: string
  userId: string
  shopId: string
  currentLocation?: string
  status: string
}

export default function CreatePackageForm({ onSuccess, onCancel, orders }: CreatePackageFormProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    orderNumber: '',
    userId: '',
    shopId: '',
    currentLocation: '',
    status: 'PENDING'
  })
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [shops, setShops] = useState<{ id: string; email: string }[]>([])
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

        // Fetch regular users using the correct endpoint
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
      const response = await fetch('/api/packages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          shopId: formData.shopId,
          userId: formData.userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create package')
      }

      const newPackage = await response.json()
      toast.success('تم إنشاء الطرد بنجاح')
      onSuccess(newPackage)
    } catch (error) {
      console.error('Error creating package:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الطرد')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">إنشاء طرد جديد</h2>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">رقم الطلب</label>
              <select
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">اختر رقم الطلب</option>
                {orders.map(order => (
                  <option key={order.id} value={order.orderNumber}>
                    {order.orderNumber} - {order.user.name}
                  </option>
                ))}
              </select>
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
                    {user.email}
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
                    {shop.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="PENDING">قيد الانتظار</option>
                <option value="IN_TRANSIT">قيد الشحن</option>
                <option value="DELIVERED">تم التسليم</option>
                <option value="CANCELLED">ملغي</option>
                <option value="RETURNED">تم الإرجاع</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center items-center mt-6">
            <div className="flex gap-4 rtl:space-x-reverse">
              <Button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 