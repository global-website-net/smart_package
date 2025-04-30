'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

interface CreateOrderFormProps {
  onClose: () => void
}

export default function CreateOrderForm({ onClose }: CreateOrderFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    purchaseSite: '',
    purchaseLink: '',
    phoneNumber: '',
    notes: '',
    additionalInfo: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      setError('يجب تسجيل الدخول لإنشاء طلب')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { data, error: insertError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: session.user.id,
            purchase_site: formData.purchaseSite,
            purchase_link: formData.purchaseLink,
            phone_number: formData.phoneNumber,
            notes: formData.notes,
            additional_info: formData.additionalInfo,
            status: 'pending'
          }
        ])
        .select()

      if (insertError) throw insertError

      onClose()
    } catch (err) {
      console.error('Error creating order:', err)
      setError('حدث خطأ أثناء إنشاء الطلب')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">إنشاء طلب جديد</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="purchaseSite" className="block text-sm font-medium text-gray-700 mb-1">
            موقع الشراء
          </label>
          <input
            type="text"
            id="purchaseSite"
            name="purchaseSite"
            value={formData.purchaseSite}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="purchaseLink" className="block text-sm font-medium text-gray-700 mb-1">
            رابط المنتج
          </label>
          <input
            type="url"
            id="purchaseLink"
            name="purchaseLink"
            value={formData.purchaseLink}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            ملاحظات
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
            معلومات إضافية
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
          </button>
        </div>
      </form>
    </div>
  )
} 