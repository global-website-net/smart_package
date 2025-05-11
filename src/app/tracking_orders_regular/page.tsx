'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import PaymentModal from '@/app/components/PaymentModal'

interface Order {
  id: string
  userId: string
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes: string | null
  additionalInfo: string | null
  status: string
  totalAmount: number
  orderNumber: string
  createdAt: string
  updatedAt: string
}

export default function TrackingOrdersRegularPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session) {
      fetchOrders()
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const orders = await response.json()
      console.log('Fetched orders:', orders)

      if (!orders || orders.length === 0) {
        console.log('No orders found for user')
        setOrders([])
        return
      }

      // Transform the data to match the Order interface
      const transformedOrders = orders.map((order: any) => ({
        id: order.id,
        userId: order.userId,
        purchaseSite: order.purchaseSite,
        purchaseLink: order.purchaseLink,
        phoneNumber: order.phoneNumber,
        notes: order.notes,
        additionalInfo: order.additionalInfo,
        status: order.status,
        totalAmount: order.totalAmount,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))

      console.log('Transformed orders:', transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error in fetchOrders:', error)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع'
      case 'PENDING_APPROVAL':
        return 'في انتظار الموافقة'
      case 'ORDERING':
        return 'قيد الطلب'
      case 'ORDER_COMPLETED':
        return 'تم الطلب'
      case 'PENDING':
        return 'قيد الانتظار'
      case 'IN_TRANSIT':
        return 'قيد الشحن'
      case 'DELIVERED':
        return 'تم التسليم'
      case 'CANCELLED':
        return 'ملغي'
      case 'RETURNED':
        return 'تم الإرجاع'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800'
      case 'RETURNED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleNewOrder = () => {
    router.push('/new-order')
  }

  const handleViewDetails = (order: Order) => {
    console.log('Viewing details for order:', order)
  }

  const handlePaymentClick = (order: Order) => {
    setSelectedOrder(order)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    setOrders(orders.map(order => 
      order.id === selectedOrder?.id 
        ? { ...order, status: 'ORDERING' }
        : order
    ))
    setSelectedOrder(null)
  }

  const handleConfirmPayment = async (order: Order) => {
    try {
      setLoading(true)
      setError(null)

      // First check if wallet exists
      const { data: existingWallet, error: fetchError } = await supabase
        .from('wallet')
        .select('id, balance')
        .eq('userId', session?.user?.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching wallet:', fetchError)
        throw new Error('حدث خطأ أثناء التحقق من المحفظة')
      }

      let walletId
      if (!existingWallet) {
        // Create new wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallet')
          .insert([
            {
              userId: session?.user?.id,
              balance: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ])
          .select('id')
          .single()

        if (createError) {
          console.error('Error creating wallet:', createError)
          if (createError.code === '42501') {
            throw new Error('ليس لديك صلاحية لإنشاء محفظة')
          }
          throw new Error('حدث خطأ أثناء إنشاء المحفظة')
        }

        if (!newWallet) {
          throw new Error('فشل في إنشاء المحفظة')
        }

        walletId = newWallet.id
      } else {
        walletId = existingWallet.id
      }

      // Update order status
      const { error: updateError } = await supabase
        .from('order')
        .update({
          status: 'AWAITING_PAYMENT',
          updatedAt: new Date().toISOString()
        })
        .eq('id', order.id)

      if (updateError) {
        console.error('Error updating order:', updateError)
        throw new Error('حدث خطأ أثناء تحديث حالة الطلب')
      }

      toast.success('تم تأكيد الدفع بنجاح')

      // Refresh orders list
      fetchOrders()
    } catch (error) {
      console.error('Error in handleConfirmPayment:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تأكيد الدفع')
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تأكيد الدفع')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">تتبع الطلبات</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center -mt-4 mb-6">
            <button
              onClick={handleNewOrder}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              طلب جديد
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">موقع الشراء</TableHead>
                <TableHead className="text-center">رابط الشراء</TableHead>
                <TableHead className="text-center">رقم الهاتف</TableHead>
                <TableHead className="text-center">المبلغ الإجمالي</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">ملاحظات</TableHead>
                <TableHead className="text-center">معلومات إضافية</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    لا توجد طلبات
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center">{order.purchaseSite}</TableCell>
                    <TableCell className="text-center">
                      <a href={order.purchaseLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {order.purchaseLink}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">{order.phoneNumber}</TableCell>
                    <TableCell className="text-center">{order.totalAmount ? `₪${order.totalAmount.toFixed(2)}` : '-'}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{order.notes || '-'}</TableCell>
                    <TableCell className="text-center">{order.additionalInfo || '-'}</TableCell>
                    <TableCell className="text-center">{new Date(order.createdAt).toLocaleDateString('ar')}</TableCell>
                    <TableCell className="text-center">
                      {order.status === 'AWAITING_PAYMENT' && (
                        <Button
                          onClick={() => handlePaymentClick(order)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          دفع
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedOrder(null)
          }}
          amount={selectedOrder.totalAmount}
          orderId={selectedOrder.id}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}