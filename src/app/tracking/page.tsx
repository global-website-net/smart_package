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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    fullName: string
    email: string
  }
}

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role === 'ADMIN' || session.user.role === 'OWNER') {
        fetchOrders()
      } else {
        router.push('/')
      }
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: orders, error } = await supabase
        .from('Order')
        .select(`
          id,
          orderNumber,
          status,
          totalAmount,
          createdAt,
          updatedAt,
          userId,
          user:User!userId (
            fullName,
            email
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform the data to match the Order interface
      const transformedOrders = orders.map(order => {
        const userData = Array.isArray(order.user) ? order.user[0] : order.user
        return {
          ...order,
          user: {
            fullName: userData?.fullName || 'غير معروف',
            email: userData?.email || ''
          }
        }
      })

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('حدث خطأ أثناء جلب الطلبات')
      toast.error('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار'
      case 'PAID':
        return 'تم الدفع'
      case 'CANCELLED':
        return 'ملغي'
      case 'COMPLETED':
        return 'مكتمل'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
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
            <h1 className="text-4xl font-bold mb-6">ادارة الطلبات</h1>
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
                <TableHead className="text-center">المبلغ الإجمالي</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">المستخدم</TableHead>
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
                    <TableCell className="text-center">{order.totalAmount.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell className="text-center">{new Date(order.createdAt).toLocaleDateString('ar')}</TableCell>
                    <TableCell className="text-center">{order.user.fullName}</TableCell>
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