'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import { supabase } from '@/lib/supabase'
import CreateOrderForm from '@/app/components/CreateOrderForm'

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  items: {
    name: string
    quantity: number
    price: number
  }[]
}

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

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
        .from('orders')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })

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
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-6">تتبع الطلبات</h1>
              <div className="flex justify-center items-center">
                <div className="relative w-32 sm:w-48 md:w-64">
                  <div className="w-full h-0.5 bg-green-500"></div>
                  <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
                </div>
              </div>
            </div>
            {session?.user?.role === 'REGULAR' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                طلب جديد
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {showCreateForm && (
            <div className="mb-8">
              <CreateOrderForm onClose={() => setShowCreateForm(false)} />
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
                      <h3 className="text-lg font-semibold">طلب رقم #{order.id}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}">
                        {order.status === 'completed' ? 'مكتمل' :
                         order.status === 'pending' ? 'قيد الانتظار' :
                         'ملغي'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium mb-2">المنتجات:</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-gray-600">
                            {item.quantity} × {item.price} ₪
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>المجموع:</span>
                      <span>{order.total_amount} ₪</span>
                    </div>
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