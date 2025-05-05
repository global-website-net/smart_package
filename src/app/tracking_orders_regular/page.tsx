'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

interface Order {
  id: string
  orderNumber: string
  status: string
  description: string | null
  shopId: string
  userId: string
  createdAt: string
  updatedAt: string
  shop: {
    id: string
    fullName: string
    email: string
  }
  user: {
    id: string
    fullName: string
    email: string
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
      fetchOrders()
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.user?.id) {
        console.error('No user ID found in session')
        throw new Error('No user ID found')
      }

      console.log('Fetching orders for user:', session.user.id)

      // First, get the orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('order')
        .select('*')
        .eq('userId', session.user.id)
        .order('createdAt', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        throw ordersError
      }

      if (!orders || orders.length === 0) {
        console.log('No orders found for user')
        setOrders([])
        return
      }

      // Get all shop IDs from the orders
      const shopIds = orders.map(order => order.shopId).filter(Boolean)
      
      // Fetch shop details in a separate query
      const { data: shops, error: shopsError } = await supabase
        .from('User')
        .select('id, fullName, email')
        .in('id', shopIds)
        .eq('role', 'SHOP')

      if (shopsError) {
        console.error('Error fetching shops:', shopsError)
        throw shopsError
      }

      // Create a map of shop details
      const shopMap = new Map(shops?.map(shop => [shop.id, shop]) || [])

      // Transform the orders with shop details
      const transformedOrders: Order[] = orders.map(order => ({
        ...order,
        shop: shopMap.get(order.shopId) || { id: '', fullName: 'غير معروف', email: '' },
        user: {
          id: session.user.id,
          fullName: session.user.fullName || 'غير معروف',
          email: session.user.email || ''
        }
      }))

      console.log('Transformed orders:', transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error in fetchOrders:', error)
      setError('حدث خطأ أثناء جلب الطلبات')
      toast.error('حدث خطأ أثناء جلب الطلبات')
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

          {error && (
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">رقم الطلب</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">الوصف</TableHead>
                <TableHead className="text-center">المتجر</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
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
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{order.description || '-'}</TableCell>
                    <TableCell className="text-center">{order.shop?.fullName || 'غير معروف'}</TableCell>
                    <TableCell className="text-center">{new Date(order.createdAt).toLocaleDateString('ar')}</TableCell>
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