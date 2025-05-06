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
  shopId: string;
  description: string;
  status: string;
}

export default function CreatePackageForm({ onPackageCreated }: CreatePackageFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    shopId: '',
    description: '',
    status: 'PENDING'
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
      console.log('Starting to fetch regular users...')
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'REGULAR')
        .order('fullName', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched users data:', data)
      if (!data || data.length === 0) {
        console.log('No regular users found in the database')
        setUsers([])
        toast.error('لا توجد مستخدمين متاحين حالياً')
      } else {
        console.log(`Found ${data.length} regular users`)
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      toast.error('حدث خطأ أثناء جلب المستخدمين')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Generate a unique tracking number
      const trackingNumber = `TRK${Date.now()}`

      // Insert the new package into the package table
      const { data, error } = await supabase
        .from('package')
        .insert([
          {
            trackingNumber: trackingNumber,
            description: formData.description,
            status: formData.status,
            userId: formData.userId,
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
      toast.success('تم إنشاء الطرد بنجاح')

      // Reset form and close modal
      setFormData({
        userId: '',
        shopId: '',
        description: '',
        status: 'PENDING'
      })
      setIsOpen(false)
      onPackageCreated()
    } catch (error) {
      console.error('Error creating package:', error)
      setError('حدث خطأ أثناء إنشاء الطرد')
      toast.error('حدث خطأ أثناء إنشاء الطرد')
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
                  {shops.length === 0 ? (
                    <option value="no-shops" disabled>
                      لا توجد متاجر متاحة
                    </option>
                  ) : (
                    shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.email}
                      </option>
                    ))
                  )}
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
                  {users.length === 0 ? (
                    <option value="no-users" disabled>
                      لا توجد مستخدمين متاحين
                    </option>
                  ) : (
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
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
                  required
                >
                  <option value="PENDING">معلق</option>
                  <option value="IN_TRANSIT">في الطريد</option>
                  <option value="DELIVERED">مسلم</option>
                  <option value="CANCELLED">ملغي</option>
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