'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Toast from '@/app/components/Toast'
import { supabase } from '@/lib/supabase'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface Shop {
  id: string
  name: string
}

interface NewOrderFormData {
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes: string
  additionalInfo: string
  shopId: string
}

export default function NewOrder() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  
  const [formData, setFormData] = useState<NewOrderFormData>({
    purchaseSite: '',
    purchaseLink: '',
    phoneNumber: '',
    notes: '',
    additionalInfo: '',
    shopId: ''
  })

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'REGULAR') {
        router.push('/')
        return
      }
      fetchShops()
    }
  }, [status, session])

  const fetchShops = async () => {
    try {
      console.log('Starting to fetch shops...')
      const response = await fetch('/api/shops/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }

      const data = await response.json()
      console.log('Fetched shops data:', data)
      console.log('Number of shops found:', data?.length || 0)
      console.log('Shop names:', data?.map((shop: { id: string; name: string }) => shop.name) || [])

      if (!data || data.length === 0) {
        console.log('No shops found')
        setShops([])
        setToastMessage('لا توجد متاجر متاحة حالياً')
        setToastType('error')
        setShowToast(true)
      } else {
        console.log(`Found ${data.length} shops`)
        setShops(data)
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setShops([])
      setToastMessage('حدث خطأ أثناء جلب المتاجر')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.shopId) {
      setToastMessage('الرجاء اختيار موقع الشراء')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!formData.purchaseLink) {
      setToastMessage('الرجاء إدخال رابط الشراء')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!formData.phoneNumber) {
      setToastMessage('الرجاء إدخال رقم الهاتف')
      setToastType('error')
      setShowToast(true)
      return
    }

    try {
      // Get the shop name from the selected shop ID
      const selectedShop = shops.find(shop => shop.id === formData.shopId)
      if (!selectedShop) {
        throw new Error('لم يتم العثور على المتجر المحدد')
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          purchaseSite: selectedShop.name // Map shopId to purchaseSite using the shop name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب')
      }

      // Show success message and reset form
      setToastMessage('تم إرسال الطلب بنجاح')
      setToastType('success')
      setShowToast(true)
      setFormData({
        purchaseSite: '',
        purchaseLink: '',
        phoneNumber: '',
        notes: '',
        additionalInfo: '',
        shopId: ''
      })
    } catch (error) {
      console.error('Error submitting order:', error)
      setToastMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleCancel = () => {
    router.push('/tracking_orders_regular')
  }

  // Add loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">طلبية جديدة</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            <div className="space-y-6">
              {/* Purchase Site */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="shopId" className="text-right">
                  موقع الشراء
                </label>
                <Select
                  value={formData.shopId}
                  onValueChange={(value) => setFormData({ ...formData, shopId: value })}
                >
                  <SelectTrigger className="col-span-3 text-right">
                    <SelectValue placeholder="اختر المتجر" className="text-right" dir="rtl" />
                  </SelectTrigger>
                  <SelectContent className="text-right" align="end">
                    {shops.length === 0 ? (
                      <SelectItem value="no-shops" disabled className="text-right">
                        لا توجد متاجر متاحة
                      </SelectItem>
                    ) : (
                      shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id} className="text-right">
                          {shop.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
                >
                  إرسال الطلب
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {showToast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
            <div className="mb-4">
              {toastType === 'success' ? (
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {toastType === 'success' ? 'تم بنجاح!' : 'حدث خطأ!'}
            </h3>
            <p className="text-gray-600 mb-4">{toastMessage}</p>
            <button
              onClick={() => {
                setShowToast(false)
                if (toastType === 'success') {
                  router.push('/tracking_orders_regular')
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors w-full"
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 