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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function TrackingOrdersRegularPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [purchaseSiteFilter, setPurchaseSiteFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const isMobile = useIsMobile()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

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

  const filteredOrders = orders.filter(order => {
    const matchesPurchaseSite = purchaseSiteFilter === '' || order.purchaseSite.includes(purchaseSiteFilter)
    const matchesStatus = statusFilter === 'ALL' || statusFilter === '' || order.status === statusFilter
    const matchesOrderNumber = orderNumberFilter === '' || order.orderNumber.toLowerCase().includes(orderNumberFilter.toLowerCase())
    return matchesPurchaseSite && matchesStatus && matchesOrderNumber
  })

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  // Collect unique statuses from orders for the dropdown
  const statusOptions = Array.from(new Set(orders.map(o => o.status)));

  // All possible order statuses (limited to the requested ones)
  const allStatusOptions = [
    { value: 'AWAITING_PAYMENT', label: 'بانتظار الدفع' },
    { value: 'PENDING_APPROVAL', label: 'في انتظار الموافقة' },
    { value: 'ORDERING', label: 'قيد الطلب' },
    { value: 'ORDER_COMPLETED', label: 'تم الطلب' },
    { value: 'CANCELLED', label: 'ملغي' },
  ];

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
      <main className="max-w-6xl mx-auto px-4 py-10 mt-[70px]">
        <h1 className="text-3xl font-bold text-center mb-2 mt-0">تتبع الطلبات</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        <div className="flex flex-col items-center mb-4">
          <button
            className="focus:outline-none"
            onClick={() => setShowDesktopFilters(v => !v)}
            aria-label="عرض الفلاتر"
            type="button"
          >
            <Image src="/images/filter_icon.png" alt="فلتر" width={32} height={32} />
          </button>
          {showDesktopFilters && (
            <div className="flex flex-col md:flex-row gap-4 mt-4 items-center bg-white p-4 rounded-lg shadow border border-gray-200 w-full md:w-auto max-w-xl">
              <input
                type="text"
                placeholder="ابحث برقم الطلب"
                className="w-full md:w-64 text-right p-2 border rounded"
                value={orderNumberFilter}
                onChange={e => setOrderNumberFilter(e.target.value)}
              />
              <select
                className="w-full md:w-48 text-right p-2 border rounded"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">كل الحالات</option>
                {allStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {currentOrders.map((order) => {
            const isSpecialStatus = getOrderStatusText(order.status) !== 'في انتظار الدفع' && getOrderStatusText(order.status) !== 'في انتظار الموافقة';
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-full max-w-xs min-h-[320px] relative">
                {/* Left-side icon for special statuses */}
                {isSpecialStatus && (
                  <img
                    src="/images/price_hex_icon.png"
                    alt="Status Icon"
                    className="absolute left-[-28px] top-1/2 -translate-y-1/2 w-10 h-10 hidden md:block"
                  />
                )}
                {/* Title */}
                <div className="flex items-center justify-center text-lg font-bold mb-2">
                  <span>طلبية</span>
                  <span className="mx-2">|</span>
                  <span className="ltr:font-mono rtl:font-mono">{order.orderNumber}</span>
                </div>
                {/* Icon */}
                <img src="/images/shopping_bag_icon.png" alt="Shopping Bag" className="w-16 h-16 my-2" />
                {/* Purchase Site */}
                <div className="mb-2 text-lg font-bold text-black">{order.purchaseSite}</div>
                {/* Status as pill/badge */}
                <div className="flex justify-center my-2">
                  <span
                    className={(() => {
                      switch (order.status) {
                        case 'ORDER_COMPLETED':
                          return 'px-4 py-1 rounded-full bg-green-100 text-green-700 text-base font-bold';
                        case 'AWAITING_PAYMENT':
                        case 'PENDING_APPROVAL':
                        case 'ORDERING':
                          return 'px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-base font-bold';
                        case 'CANCELLED':
                          return 'px-4 py-1 rounded-full bg-red-100 text-red-700 text-base font-bold';
                        default:
                          return 'px-4 py-1 rounded-full bg-gray-200 text-gray-700 text-base font-bold';
                      }
                    })()}
                  >
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
                {/* Payment button if needed */}
                {order.status === 'AWAITING_PAYMENT' && (
                  <button
                    className="mt-2 mb-2 px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
                    onClick={() => handlePaymentClick(order)}
                  >
                    دفع
                  </button>
                )}
                {/* Creation date */}
                <div className="mt-auto text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US')}</div>
              </div>
            );
          })}
        </div>
        {/* Mobile/table fallback: keep existing table or list */}
        {isMobile && (
          <div className="flex flex-col gap-6">
            {/* Mobile Filters Icon */}
            <div className="flex justify-start mb-4">
              <button
                className="p-0 bg-transparent border-none shadow-none"
                style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                onClick={() => setShowMobileFilters(v => !v)}
                aria-label="عرض الفلاتر"
              >
                <Filter className="w-7 h-7 text-black" fill="black" />
              </button>
            </div>
            {showMobileFilters && (
              <div className="flex flex-col gap-3 mb-4 p-4 bg-white rounded-lg shadow border border-gray-200">
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب"
                  className="w-full md:w-64 text-right p-2 border rounded"
                  value={orderNumberFilter}
                  onChange={e => setOrderNumberFilter(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="ابحث بموقع الشراء"
                  className="w-full md:w-64 text-right p-2 border rounded"
                  value={purchaseSiteFilter}
                  onChange={e => setPurchaseSiteFilter(e.target.value)}
                />
                <select
                  className="w-full md:w-48 text-right p-2 border rounded"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="PENDING_APPROVAL">في انتظار الموافقة</option>
                  <option value="AWAITING_PAYMENT">في انتظار الدفع</option>
                  <option value="ORDERING">قيد الطلب</option>
                  <option value="ORDER_COMPLETED">تم الطلب</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
              </div>
            )}
            {currentOrders.length === 0 ? (
              <div className="text-center py-8">لا توجد طلبات</div>
            ) : (
              currentOrders.map((order, idx) => (
                <div key={order.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-200">
                  {/* Order Card Title */}
                  <div className="flex items-center justify-center gap-2 text-xl font-bold mb-2">
                    <span>طلبية</span>
                    <span className="mx-1">|</span>
                    <span>O - {order.orderNumber}</span>
                  </div>
                  {/* Package Icon SVG (from main page) */}
                  <div className="my-4 text-5xl text-center">
                    🛒
                  </div>
                  <div className="mb-2 text-xl font-bold text-black">{order.purchaseSite}</div>
                  {/* Status as pill/badge */}
                  <div className="flex justify-center my-2">
                    <span
                      className={(() => {
                        switch (order.status) {
                          case 'ORDER_COMPLETED':
                            return 'px-4 py-1 rounded-full bg-green-100 text-green-700 text-base font-bold';
                          case 'AWAITING_PAYMENT':
                          case 'PENDING_APPROVAL':
                          case 'ORDERING':
                            return 'px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-base font-bold';
                          case 'CANCELLED':
                            return 'px-4 py-1 rounded-full bg-red-100 text-red-700 text-base font-bold';
                          default:
                            return 'px-4 py-1 rounded-full bg-gray-200 text-gray-700 text-base font-bold';
                        }
                      })()}
                    >
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                  {/* Pay button for AWAITING_PAYMENT status */}
                  {order.status === 'AWAITING_PAYMENT' && (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md mt-2"
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsPaymentModalOpen(true)
                      }}
                    >
                      دفع
                    </button>
                  )}
                  {/* Optionally show order code or totalAmount if needed */}
                  {/* <div className="mb-2 text-gray-500 text-sm">{order.orderNumber}</div> */}
                  {/* Creation date */}
                  <div className="mt-auto text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US')}</div>
                </div>
              ))
            )}
          </div>
        )}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderId={selectedOrder?.id ?? ''}
          amount={selectedOrder?.totalAmount ?? 0}
          onPaymentComplete={handlePaymentComplete}
        />
      </main>
    </div>
  )
}
