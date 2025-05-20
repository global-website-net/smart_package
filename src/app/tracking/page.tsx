'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { EditOrderStatusModal } from '@/app/components/EditOrderStatusModal'
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Order {
  id: string
  userId: string
  phoneNumber: string
  notes: string | null
  additionalInfo: string | null
  status: string
  totalAmount: number
  orderNumber: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  description: string | null
  shopId: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
  shop: {
    fullName: string
    email: string
  }
}

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'تم الاستلام' }
]

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role === 'ADMIN' || session.user.role === 'OWNER') {
        fetchOrders()
      } else if (session.user.role === 'SHOP') {
        fetchPackages()
      } else {
        router.push('/')
      }
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const orders = await response.json()
      console.log('Fetched orders:', orders)

      if (!orders || orders.length === 0) {
        console.log('No orders found in the database')
        setOrders([])
        return
      }

      // Transform the data to match the Order interface
      const transformedOrders = orders.map((order: any) => {
        const userData = Array.isArray(order.user) ? order.user[0] : order.user

        return {
          ...order,
          user: {
            fullName: userData?.fullName || 'غير معروف',
            email: userData?.email || ''
          }
        }
      })

      console.log('Transformed orders:', transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error in fetchOrders:', error)
      setError('حدث خطأ أثناء جلب الطلبات')
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب الطلبات',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('package')
        .select(`
          *,
          user:userId (fullName, email),
          shop:shopId (fullName, email)
        `)
        .eq('shopId', session?.user?.id)

      if (error) throw error

      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب الطرود',
        variant: 'destructive'
      })
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
      case 'CANCELLED':
        return 'ملغي'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
      case 'PENDING_APPROVAL':
      case 'ORDERING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditStatus = (order: Order) => {
    setEditingOrder(order)
  }

  const handleUpdate = async () => {
    if (!selectedPackage) return

    try {
      setUpdating(true)
      const { error } = await supabase
        .from('package')
        .update({ 
          status: selectedPackage.status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedPackage.id)

      if (error) throw error

      setPackages(packages.map(pkg => 
        pkg.id === selectedPackage.id ? selectedPackage : pkg
      ))

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة الطرد بنجاح'
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating package:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الطرد',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع'
      case 'PREPARING':
        return 'قيد التحضير'
      case 'DELIVERING_TO_SHOP':
        return 'قيد التوصيل للمتجر'
      case 'IN_SHOP':
        return 'في المتجر'
      case 'RECEIVED':
        return 'تم الاستلام'
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

  // Calculate pagination
  const filteredOrders = orders.filter(order => {
    const matchesOrderNumber = orderNumberFilter === '' || order.orderNumber.includes(orderNumberFilter)
    const matchesStatus = statusFilter === 'ALL' || statusFilter === '' || order.status === statusFilter
    return matchesOrderNumber && matchesStatus
  })
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
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
      <main className="p-4 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">إدارة الطلبات</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-48 md:w-64">
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-center">
            <Input
              type="text"
              placeholder="ابحث برقم الطلب"
              className="w-full md:w-64 text-right"
              value={orderNumberFilter}
              onChange={e => setOrderNumberFilter(e.target.value)}
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-48 text-right">
                <SelectValue placeholder="كل الحالات" className="text-right" />
              </SelectTrigger>
              <SelectContent className="text-right" align="end">
                <SelectItem value="ALL">كل الحالات</SelectItem>
                <SelectItem value="PENDING_APPROVAL">في انتظار الموافقة</SelectItem>
                <SelectItem value="AWAITING_PAYMENT">في انتظار الدفع</SelectItem>
                <SelectItem value="ORDERING">قيد الطلب</SelectItem>
                <SelectItem value="ORDER_COMPLETED">تم الطلب</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-base font-bold">رقم الطلب</TableHead>
                <TableHead className="text-center text-base font-bold">رقم الهاتف</TableHead>
                <TableHead className="text-center text-base font-bold">المبلغ</TableHead>
                <TableHead className="text-center text-base font-bold">الحالة</TableHead>
                <TableHead className="text-center text-base font-bold">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center text-base font-bold">ملاحظات</TableHead>
                <TableHead className="text-center text-base font-bold">معلومات إضافية</TableHead>
                <TableHead className="text-center text-base font-bold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 align-middle">
                    <span className="inline-block w-full">لا توجد طلبات</span>
                  </TableCell>
                </TableRow>
              ) : (
                currentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center">{order.orderNumber}</TableCell>
                    <TableCell className="text-center">{order.phoneNumber}</TableCell>
                    <TableCell className="text-center">{order.totalAmount}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{new Date(order.createdAt).toLocaleDateString('ar')}</TableCell>
                    <TableCell className="text-center">{order.notes || '-'}</TableCell>
                    <TableCell className="text-center">{order.additionalInfo || '-'}</TableCell>
                    <TableCell className="text-center">
                      {session?.user.role === 'ADMIN' || session?.user.role === 'OWNER' ? (
                        <button
                          onClick={() => handleEditStatus(order)}
                          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          تعديل
                        </button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls - Always show */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <span className="text-sm text-gray-600">
              الصفحة {currentPage} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {editingOrder && (
        <EditOrderStatusModal
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={() => {
            setEditingOrder(null)
            fetchOrders() // Refresh the orders list
          }}
        />
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الطرد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>رقم التتبع</Label>
              <Input
                value={selectedPackage?.trackingNumber}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={selectedPackage?.status}
                onValueChange={(value) => setSelectedPackage(prev => prev ? { ...prev, status: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updating}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 