'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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
  onPackageCreated: () => void
}

interface FormData {
  userId: string;
  purchaseSite: string;
  purchaseLink: string;
  phoneNumber: string;
  notes: string;
  additionalInfo: string;
  status: string;
  shopId: string;
}

export default function CreatePackageForm({ onPackageCreated }: CreatePackageFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    purchaseSite: '',
    purchaseLink: '',
    phoneNumber: '',
    notes: '',
    additionalInfo: '',
    status: 'PENDING',
    shopId: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchShops()
      fetchUsers()
    }
  }, [isOpen])

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'SHOP')

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        console.log('No SHOP users found')
      } else {
        console.log('Found SHOP users:', data)
      }

      setShops(data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
      setError('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id, fullName, email')
        .eq('role', 'REGULAR')

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        console.log('No REGULAR users found')
      } else {
        console.log('Found REGULAR users:', data)
      }

      setUsers(data || [])
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
      // Insert the new order into the order table
      const { data, error } = await supabase
        .from('order')
        .insert([
          {
            userId: formData.userId,
            purchaseSite: formData.purchaseSite,
            purchaseLink: formData.purchaseLink,
            phoneNumber: formData.phoneNumber,
            notes: formData.notes,
            additionalInfo: formData.additionalInfo,
            status: formData.status,
            shopId: formData.shopId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        throw error
      }

      // Show success message
      toast.success('تم إنشاء الطلب بنجاح')

      // Reset form and close modal
      setFormData({
        userId: '',
        purchaseSite: '',
        purchaseLink: '',
        phoneNumber: '',
        notes: '',
        additionalInfo: '',
        status: 'PENDING',
        shopId: ''
      })
      setIsOpen(false)
      onPackageCreated()
    } catch (error) {
      console.error('Error creating order:', error)
      setError('حدث خطأ أثناء إنشاء الطلب')
      toast.error('حدث خطأ أثناء إنشاء الطلب')
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
        إضافة طلب جديد
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">إضافة طلب جديد</h2>
            
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="purchaseSite" className="block text-sm font-medium text-gray-700 mb-1">
                  موقع الشراء
                </label>
                <input
                  type="text"
                  id="purchaseSite"
                  value={formData.purchaseSite}
                  onChange={(e) => setFormData({ ...formData, purchaseSite: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="purchaseLink" className="block text-sm font-medium text-gray-700 mb-1">
                  رابط الشراء
                </label>
                <input
                  type="text"
                  id="purchaseLink"
                  value={formData.purchaseLink}
                  onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  معلومات إضافية
                </label>
                <textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
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
                      {shop.email}
                    </option>
                  ))}
                </select>
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
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 