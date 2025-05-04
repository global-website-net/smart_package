'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Shop {
  id: string
  fullName: string
  email: string
}

interface User {
  id: string
  fullName: string
  email: string
}

interface CreatePackageFormProps {
  onSuccess: (newPackage: any) => void
  onCancel: () => void
}

interface FormData {
  trackingNumber: string
  status: string
  shopId: string
  description: string
  userId: string
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreatePackageForm({ onSuccess, onCancel }: CreatePackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<FormData>({
    trackingNumber: '',
    status: 'PENDING',
    shopId: '',
    description: '',
    userId: '',
  })

  useEffect(() => {
    fetchShops()
    fetchUsers()
  }, [])

  const fetchShops = async () => {
    try {
      const { data: shops, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'SHOP')

      if (error) throw error
      setShops(shops)
    } catch (error) {
      console.error('Error fetching shops:', error)
      setError('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'REGULAR')

      if (error) throw error
      setUsers(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('حدث خطأ أثناء جلب المستخدمين')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const { data: packageData, error } = await supabase
        .from('package')
        .insert([
          {
            trackingNumber: formData.trackingNumber,
            status: formData.status,
            description: formData.description,
            userId: formData.userId,
            shopId: formData.shopId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      onSuccess(packageData)
    } catch (error) {
      console.error('Error creating package:', error)
      setError('حدث خطأ أثناء إنشاء الشحنة')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">إضافة شحنة جديدة</h2>
        
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
            <select
              id="shopId"
              value={formData.shopId}
              onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">اختر المتجر</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              الوصف
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              المستخدم
            </label>
            <select
              id="userId"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">اختر المستخدم</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإضافة...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 