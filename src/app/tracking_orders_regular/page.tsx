'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

interface Order {
  id: string
  orderNumber: string
  status: string
  purchaseSite: string
  purchaseLink: string
  phoneNumber: string
  notes: string
  additionalInfo: string
  createdAt: string
  updatedAt: string
  userId: string
  shop: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
}

export default function UserOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session) {
      if (session.user.role !== 'REGULAR') {
        router.push('/')
        return
      }
      // Only fetch orders once when the component mounts
      if (orders.length === 0) {
        fetchOrders()
      }
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.user?.id) {
        console.error('No user ID found in session')
        throw new Error('User not found')
      }

      console.log('Fetching orders for user ID:', session.user.id)

      const { data: orders, error } = await supabase
        .from('order')
        .select(`
          id,
          userId,
          purchaseSite,
          purchaseLink,
          phoneNumber,
          notes,
          additionalInfo,
          status,
          createdAt,
          updatedAt,
          shop:shop (
            id,
            name,
            email,
            createdAt,
            updatedAt
          )
        `)
        .eq('userId', session.user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        throw error
      }

      console.log('Raw orders data from Supabase:', orders)

      if (!orders || orders.length === 0) {
        console.log('No orders found for user ID:', session.user.id)
        setOrders([])
        return
      }

      // Transform the data to match the Order interface
      const transformedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.id, // Using id as orderNumber since it's not in the table
        status: order.status,
        purchaseSite: order.purchaseSite,
        purchaseLink: order.purchaseLink,
        phoneNumber: order.phoneNumber,
        notes: order.notes,
        additionalInfo: order.additionalInfo,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        userId: order.userId,
        shop: order.shop?.[0] || null
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
      case 'PENDING_APPROVAL':
        return 'في انتظار الموافقة'
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع'
      case 'ORDERING':
        return 'قيد الطلب'
      case 'ORDER_COMPLETED':
        return 'تم الطلب'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'AWAITING_PAYMENT':
        return 'bg-blue-100 text-blue-800'
      case 'ORDERING':
        return 'bg-purple-100 text-purple-800'
      case 'ORDER_COMPLETED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleNewOrder = () => {
    router.push('/new-order')
  }

  const handleViewDetails = (order: Order) => {
    // Implement the logic to view order details
    console.log('Viewing details for order:', order)
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
      <div className="pt-32 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">تتبع الطلبات</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
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
                <TableHead className="text-center">رقم الطلب</TableHead>
                <TableHead className="text-center">موقع الشراء</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    لا توجد طلبات
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center">{order.orderNumber}</TableCell>
                    <TableCell className="text-center">{order.purchaseSite}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{new Date(order.createdAt).toLocaleDateString('ar')}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 