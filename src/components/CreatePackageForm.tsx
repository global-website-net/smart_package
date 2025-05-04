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
    fullName: string
    email: string
  }
}

interface CreatePackageFormProps {
  onSuccess: (newPackage: any) => void
  onCancel: () => void
}

interface PackageFormData {
  orderNumber: string
  userId: string
  shopId: string
  currentLocation?: string
  status: string
}

export default function CreatePackageForm({ onSuccess, onCancel }: CreatePackageFormProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    orderNumber: '',
    userId: '',
    shopId: '',
    status: 'PENDING'
  })
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [shops, setShops] = useState<{ id: string; email: string }[]>([])
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; userId: string; user: { fullName: string } }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchShops()
    fetchOrders()
  }, [])

  // When an order is selected, automatically set the user
  useEffect(() => {
    if (formData.orderNumber) {
      const selectedOrder = orders.find(order => order.orderNumber === formData.orderNumber)
      if (selectedOrder) {
        setFormData(prev => ({
          ...prev,
          userId: selectedOrder.userId
        }))
      }
    }
  }, [formData.orderNumber, orders])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/regular')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users')
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      setError('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/all')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('حدث خطأ أثناء جلب الطلبات')
    }
  }

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
          orderNumber: formData.orderNumber,
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
                    {order.orderNumber} - {order.user?.fullName || 'غير معروف'}
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
                disabled={!!formData.orderNumber} // Disable if order is selected
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

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 