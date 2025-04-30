'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  userId: string
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes: string | null
  additionalInfo: string | null
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchOrders()
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('Order')
        .select('*')
        .eq('userId', session?.user?.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">تتبع الطلبات</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">طلب #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'PENDING' ? 'قيد الانتظار' :
                       order.status === 'PROCESSING' ? 'قيد المعالجة' :
                       order.status === 'COMPLETED' ? 'مكتمل' :
                       'ملغي'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">موقع الشراء:</span> {order.purchaseSite}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">رابط الشراء:</span>{' '}
                      <a href={order.purchaseLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        اضغط هنا
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">رقم الهاتف:</span> {order.phoneNumber}
                    </p>
                    {order.notes && (
                      <p className="text-gray-600">
                        <span className="font-medium">ملاحظات:</span> {order.notes}
                      </p>
                    )}
                    {order.additionalInfo && (
                      <p className="text-gray-600">
                        <span className="font-medium">معلومات إضافية:</span> {order.additionalInfo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 