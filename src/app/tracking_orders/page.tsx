'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'

interface Order {
  id: string
  userId: string
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes: string | null
  additionalInfo: string | null
  status: string
  createdAt: string
  user: {
    fullName: string
    email: string
  }
}

export default function TrackingOrders() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/admin')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'حدث خطأ أثناء جلب الطلبات')
        }

        const data = await response.json()
        setOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الطلبات')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user && (session.user.role === 'ADMIN' || session.user.role === 'OWNER')) {
      fetchOrders()
    }
  }, [session])

  // Redirect if not admin/owner
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-6">إدارة الطلبات</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-64 md:w-80">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">جاري تحميل الطلبات...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">لا توجد طلبات حالياً</div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستخدم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        موقع الشراء
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الهاتف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.user.fullName}</div>
                          <div className="text-sm text-gray-500">{order.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.purchaseSite}</div>
                          <a 
                            href={order.purchaseLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-500"
                          >
                            عرض الرابط
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'PENDING' ? 'قيد الانتظار' :
                             order.status === 'PROCESSING' ? 'قيد المعالجة' :
                             order.status === 'COMPLETED' ? 'مكتمل' :
                             order.status === 'CANCELLED' ? 'ملغي' :
                             order.status === 'IN_TRANSIT' ? 'قيد الشحن' :
                             order.status === 'DELIVERED' ? 'تم التسليم' :
                             order.status === 'RETURNED' ? 'تم الإرجاع' :
                             order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/tracking_orders/${order.id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            عرض التفاصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 