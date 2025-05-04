'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import Link from 'next/link'
import EditPackageStatus from '@/components/EditPackageStatus'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import PaymentConfirmationWizard from '@/components/PaymentConfirmationWizard'

interface Package {
  id: string
  trackingNumber: string
  description: string
  status: string
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
  totalAmount?: number
}

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showPaymentWizard, setShowPaymentWizard] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)

  const statusOptions = [
    { value: 'PENDING_APPROVAL', label: 'في انتظار الموافقة' },
    { value: 'AWAITING_PAYMENT', label: 'في انتظار الدفع' },
    { value: 'ORDERING', label: 'قيد الطلب' },
    { value: 'ORDER_COMPLETED', label: 'تم الطلب' }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role === 'ADMIN' || session.user.role === 'OWNER') {
        fetchAllOrders()
        fetchPackages()
      } else {
        fetchOrders()
      }
    }
  }, [status])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/orders/all')
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
      case 'PENDING_APPROVAL':
        return 'في انتظار الموافقة'
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع'
      case 'ORDERING':
        return 'قيد الطلب'
      case 'ORDER_COMPLETED':
        return 'تم الطلب'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'AWAITING_PAYMENT':
        return 'bg-orange-100 text-orange-800'
      case 'ORDERING':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'ORDER_COMPLETED':
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order status')
      }

      const updatedOrder = await response.json()
      
      // Update the orders state with the new status
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt }
          : order
      ))

      // Close the edit form
      setEditingOrder(null)
      
      // Show success message
      toast.success('تم تحديث حالة الطلب بنجاح')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الطلب')
    }
  }

  const handlePayClick = (order: Order) => {
    setSelectedOrder(order)
    setPaymentAmount(order.totalAmount || 0)
    setShowPaymentWizard(true)
  }

  const handlePaymentConfirm = async () => {
    try {
      // First check if user has enough balance
      const walletResponse = await fetch('/api/wallet')
      if (!walletResponse.ok) {
        throw new Error('Failed to fetch wallet data')
      }
      const walletData = await walletResponse.json()

      if (walletData.balance < paymentAmount) {
        toast.error('رصيد المحفظة غير كافٍ')
        return
      }

      // Process payment
      const paymentResponse = await fetch('/api/orders/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder?.id,
          amount: paymentAmount
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to process payment')
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrder?.id 
          ? { ...order, status: 'ORDERING' }
          : order
      ))

      toast.success('تم الدفع بنجاح')
      setShowPaymentWizard(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('حدث خطأ أثناء عملية الدفع')
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
  const isEmpty = isAdminOrOwner ? (orders.length === 0 && packages.length === 0) : orders.length === 0

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

          {!loading && isEmpty ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-6">
              {isAdminOrOwner ? (
                <>
                  {orders.map((order) => (
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
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <Button
                                variant="outline"
                                className="font-bold bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => setEditingOrder(order)}
                              >
                                تعديل
                              </Button>
                            )}
                          </div>
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
                          <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">آخر تحديث</p>
                          <p className="font-medium">{new Date(order.updatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">رقم التتبع</p>
                          <p className="font-medium">{pkg.trackingNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">الحالة</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                              {getStatusText(pkg.status)}
                            </span>
                            {session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER' ? (
                              <Button
                                variant="outline"
                                onClick={() => setEditingPackage(pkg)}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                              >
                                تعديل
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">المستخدم</p>
                          <p className="font-medium">{pkg.user?.fullName || 'غير معروف'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">المتجر</p>
                          <p className="font-medium">{pkg.shop?.fullName || 'غير معروف'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                          <p className="font-medium">{new Date(pkg.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">آخر تحديث</p>
                          <p className="font-medium">{new Date(pkg.updatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {session?.user?.role === 'REGULAR' && order.status === 'AWAITING_PAYMENT' && (
                            <Button
                              onClick={() => handlePayClick(order)}
                              className="bg-green-500 text-white hover:bg-green-600"
                            >
                              دفع
                            </Button>
                          )}
                        </div>
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
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">آخر تحديث</p>
                        <p className="font-medium">{new Date(order.updatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {editingPackage && (
        <EditPackageStatus
          packageId={editingPackage.id}
          currentStatus={editingPackage.status}
          onClose={() => setEditingPackage(null)}
          onSuccess={() => {
            fetchPackages()
            setEditingPackage(null)
          }}
        />
      )}

      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">تعديل حالة الطلب</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">الحالة</label>
              <select
                value={editingOrder.status}
                onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-6 gap-4">
              <button
                onClick={() => setEditingOrder(null)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateOrderStatus(editingOrder.id, editingOrder.status)}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentWizard && (
        <PaymentConfirmationWizard
          onClose={() => {
            setShowPaymentWizard(false)
            setSelectedOrder(null)
          }}
          onConfirm={handlePaymentConfirm}
          amount={paymentAmount}
        />
      )}
    </div>
  )
} 