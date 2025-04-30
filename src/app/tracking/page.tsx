'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import Link from 'next/link'

interface Package {
  id: string
  trackingNumber: string
  status: string
  currentLocation?: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
  shop: {
    fullName: string
  }
}

interface Order {
  id: string
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes?: string
  additionalInfo?: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role === 'ADMIN' || session.user.role === 'OWNER') {
        fetchPackages()
      } else {
        fetchOrders()
      }
    }
  }, [status])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/packages/all')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }

      const data = await response.json()
      setPackages(data)
    } catch (err) {
      console.error('Error fetching packages:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/orders/my-orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار'
      case 'PROCESSING':
        return 'قيد المعالجة'
      case 'SHIPPED':
        return 'تم الشحن'
      case 'DELIVERED':
        return 'تم التسليم'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return status
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

  const isAdminOrOwner = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'
  const items = isAdminOrOwner ? packages : orders
  const isEmpty = items.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">
              {isAdminOrOwner ? 'ادارة الطلبات' : 'تتبع الطلبات'}
            </h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {session?.user?.role === 'REGULAR' && (
              <div className="mt-6">
                <Link
                  href="/new-order"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  طلب جديد
                </Link>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {isEmpty ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-6">
              {isAdminOrOwner ? (
                packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">رقم التتبع</p>
                        <p className="font-medium">{pkg.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">الحالة</p>
                        <p className="font-medium">{getStatusText(pkg.status)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">الموقع الحالي</p>
                        <p className="font-medium">{pkg.currentLocation || 'غير متوفر'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">المتجر</p>
                        <p className="font-medium">{pkg.shop?.fullName || 'غير متوفر'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                        <p className="font-medium">{new Date(pkg.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">آخر تحديث</p>
                        <p className="font-medium">{new Date(pkg.updatedAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">موقع الشراء</p>
                        <p className="font-medium">{order.purchaseSite}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">رابط الشراء</p>
                        <a 
                          href={order.purchaseLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium text-green-600 hover:text-green-700"
                        >
                          {order.purchaseLink}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                        <p className="font-medium">{order.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">الحالة</p>
                        <p className="font-medium">{getStatusText(order.status)}</p>
                      </div>
                      {order.notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">ملاحظات</p>
                          <p className="font-medium">{order.notes}</p>
                        </div>
                      )}
                      {order.additionalInfo && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">معلومات إضافية</p>
                          <p className="font-medium">{order.additionalInfo}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">آخر تحديث</p>
                        <p className="font-medium">{new Date(order.updatedAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 