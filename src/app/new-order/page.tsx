'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function NewOrder() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    purchaseSite: '',
    purchaseLink: '',
    phoneNumber: '',
    notes: '',
    additionalInfo: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب')
      }

      // Show success message and reset form
      alert('تم إرسال الطلب بنجاح')
      setFormData({
        purchaseSite: '',
        purchaseLink: '',
        phoneNumber: '',
        notes: '',
        additionalInfo: ''
      })
    } catch (error) {
      console.error('Error submitting order:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب')
    }
  }

  // Redirect if not logged in or not a regular user
  if (!session?.user || session.user.role !== 'REGULAR') {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">طلبية جديدة</h1>
          <div className="h-1 w-32 bg-green-500 mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Purchase Site */}
            <div>
              <label htmlFor="purchaseSite" className="block text-gray-700 text-right mb-2">
                موقع الشراء
              </label>
              <input
                type="text"
                id="purchaseSite"
                name="purchaseSite"
                value={formData.purchaseSite}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                dir="rtl"
              />
            </div>

            {/* Purchase Link */}
            <div>
              <label htmlFor="purchaseLink" className="block text-gray-700 text-right mb-2">
                لينك الشراء
              </label>
              <input
                type="text"
                id="purchaseLink"
                name="purchaseLink"
                value={formData.purchaseLink}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                dir="rtl"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 text-right mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                dir="rtl"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-gray-700 text-right mb-2">
                ملاحظات
              </label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                dir="rtl"
              />
            </div>

            {/* Additional Information Box */}
            <div>
              <div className="border-2 border-gray-200 rounded-md p-4">
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="معلومات إضافية..."
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                إرسال الطلب
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 