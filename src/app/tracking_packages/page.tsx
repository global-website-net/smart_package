'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import CreatePackageForm from '@/components/CreatePackageForm'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  fullName: string
  email: string
  role: string
}

interface Shop {
  id: string
  fullName: string
  email: string
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  description?: string
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  orderNumber?: string
  user: {
    fullName: string
    email: string
  }[]
  shop: {
    fullName: string
  }[]
}

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    fullName: string
    email: string
  }
}

export default function TrackingPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [regularUsers, setRegularUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role === 'ADMIN' || session.user.role === 'OWNER') {
        fetchOrders()
        fetchPackages()
      } else {
        router.push('/')
      }
      fetchShops()
      fetchRegularUsers()
      checkAdminOrOwner()
    }
  }, [status])

  const checkAdminOrOwner = () => {
    if (session && session.user && session.user.role) {
      setIsAdminOrOwner(session.user.role === 'ADMIN' || session.user.role === 'OWNER')
    }
  }

  const fetchShops = async () => {
    try {
      const { data: shops, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'SHOP')

      if (error) throw error
      setShops(shops)
    } catch (err) {
      console.error('Error fetching shops:', err)
      setError('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      // First get all orders
      const { data: orders, error: ordersError } = await supabase
        .from('order')
        .select(`
          id,
          orderNumber,
          status,
          createdAt,
          updatedAt,
          userId,
          user:User!userId (
            id,
            fullName,
            email
          )
        `)
        .order('createdAt', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        throw ordersError
      }

      // Get all packages to check which orders already have packages
      const { data: packages, error: packagesError } = await supabase
        .from('package')
        .select('orderNumber')

      if (packagesError) {
        console.error('Error fetching packages:', packagesError)
        throw packagesError
      }

      // Filter out orders that already have packages
      const usedOrderNumbers = new Set(packages?.map(p => p.orderNumber) || [])
      const availableOrders = orders?.filter(order => !usedOrderNumbers.has(order.orderNumber)) || []
      
      // Transform the data to match the Order interface
      const transformedOrders = availableOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        userId: order.userId,
        user: {
          id: order.user?.[0]?.id,
          fullName: order.user?.[0]?.fullName || 'غير معروف',
          email: order.user?.[0]?.email || ''
        }
      }))
      
      setOrders(transformedOrders)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegularUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('User')
        .select('id, fullName, email, role')
        .eq('role', 'REGULAR')

      if (error) throw error
      setRegularUsers(users as User[])
    } catch (error) {
      console.error('Error fetching regular users:', error)
      setError('Failed to load regular users')
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: packages, error } = await supabase
        .from('package')
        .select(`
          *,
          user:userId (
            fullName,
            email
          ),
          shop:shopId (
            fullName
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform the data to match the Package interface
      const transformedPackages = packages.map(pkg => ({
        ...pkg,
        user: [pkg.user], // Wrap in array to match interface
        shop: [pkg.shop]  // Wrap in array to match interface
      }))

      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('package')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('تم حذف الطرد بنجاح')
      setPackages(packages.filter(pkg => pkg.id !== id))
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error('حدث خطأ أثناء حذف الطرد')
    }
  }

  const getPackageStatusText = (status: string) => {
    switch (status) {
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
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'RETURNED':
        return 'bg-orange-100 text-orange-800'
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
            <h1 className="text-4xl font-bold mb-6">
              {session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER' ? 'ادارة الطرود' : 'تتبع الطرود'}
            </h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  إضافة طرد جديد
                </Button>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم التتبع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>المتجر</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.trackingNumber}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                      {getPackageStatusText(pkg.status)}
                    </span>
                  </TableCell>
                  <TableCell>{pkg.description || 'لا يوجد وصف'}</TableCell>
                  <TableCell>{new Date(pkg.createdAt).toLocaleDateString('ar')}</TableCell>
                  <TableCell>{pkg.shop?.[0]?.fullName || 'غير محدد'}</TableCell>
                  <TableCell>{pkg.user?.[0]?.fullName || 'غير محدد'}</TableCell>
                  <TableCell>
                    <div className="flex gap-4 rtl:space-x-reverse">
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        حذف
                      </button>
                      <button
                        onClick={() => router.push(`/packages/edit/${pkg.id}`)}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        تعديل
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Package Modal */}
      {showCreateForm && (
        <CreatePackageForm
          onSuccess={(newPackage) => {
            setPackages([newPackage, ...packages])
            setShowCreateForm(false)
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الطرد رقم {editingPackage.trackingNumber}؟
            </p>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setEditingPackage(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(editingPackage.id)
                  setEditingPackage(null)
                }}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 