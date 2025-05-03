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
  name: string
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
  currentLocation: string
  orderNumber: string
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
  }
  shop: {
    name: string
    email: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  updatedAt: string
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
  const [newPackage, setNewPackage] = useState({
    orderNumber: '',
    userId: '',
    shopId: '',
    status: 'PENDING',
    currentLocation: ''
  })
  const [shopUsers, setShopUsers] = useState<User[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchPackages()
      fetchOrders()
      fetchShops()
      fetchRegularUsers()
      fetchShopUsers()
    }
  }, [status])

  const fetchShops = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }

      const data = await response.json()
      // Filter out any shops that don't have a fullName
      const validShops = data.filter((shop: Shop) => shop.fullName)
      setShops(validShops)
    } catch (err) {
      console.error('Error fetching shops:', err)
      setError('حدث خطأ أثناء جلب المتاجر')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      // Filter out any orders that don't have an orderNumber
      const validOrders = data.filter((order: Order) => order.orderNumber)
      setOrders(validOrders)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegularUsers = async () => {
    try {
      const response = await fetch('/api/users?role=REGULAR')
      if (!response.ok) throw new Error('Failed to fetch regular users')
      const data = await response.json()
      setRegularUsers(data)
    } catch (error) {
      console.error('Error fetching regular users:', error)
      setError('Failed to load regular users')
    }
  }

  const fetchShopUsers = async () => {
    try {
      const response = await fetch('/api/users?role=SHOP')
      if (!response.ok) throw new Error('Failed to fetch shop users')
      const data = await response.json()
      setShopUsers(data)
    } catch (error) {
      console.error('Error fetching shop users:', error)
      setError('Failed to load shop users')
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: packages, error } = await supabase
        .from('package')
        .select(`
          id,
          trackingNumber,
          status,
          currentLocation,
          createdAt,
          updatedAt,
          user:User (
            fullName,
            email
          ),
          shop:Shop (
            fullName
          ),
          orderNumber
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      if (packages) {
        setPackages(packages as unknown as Package[])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `PKG-${timestamp}-${random}`.toUpperCase()
  }

  const handleCreatePackage = async () => {
    try {
      const trackingNumber = generateTrackingNumber()
      
      const { data, error } = await supabase
        .from('package')
        .insert([
          {
            trackingNumber,
            status: newPackage.status,
            currentLocation: newPackage.currentLocation,
            orderNumber: newPackage.orderNumber,
            shopId: newPackage.shopId,
            userId: newPackage.userId
          }
        ])
        .select()

      if (error) throw error

      if (data) {
        toast.success('تم إنشاء الطرد بنجاح')
        setPackages([data[0], ...packages])
        setShowCreateForm(false)
        setNewPackage({
          status: 'PENDING',
          currentLocation: '',
          orderNumber: '',
          shopId: '',
          userId: ''
        })
      }
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error('حدث خطأ أثناء إنشاء الطرد')
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
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-6">إدارة الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-64 md:w-80">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                إضافة طرد جديد
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم التتبع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>المتجر</TableHead>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.trackingNumber}</TableCell>
                  <TableCell>{pkg.status}</TableCell>
                  <TableCell>{pkg.user.name}</TableCell>
                  <TableCell>{pkg.shop.name}</TableCell>
                  <TableCell>{pkg.orderNumber}</TableCell>
                  <TableCell>{new Date(pkg.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/packages/edit/${pkg.id}`)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        حذف
                      </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">إنشاء طرد جديد</h2>
            <form onSubmit={handleCreatePackage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الطلب
                </label>
                <select
                  name="orderNumber"
                  value={newPackage.orderNumber}
                  onChange={(e) => setNewPackage({ ...newPackage, orderNumber: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">اختر رقم الطلب</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.orderNumber}>
                      {order.orderNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المستخدم
                </label>
                <select
                  name="userId"
                  value={newPackage.userId}
                  onChange={(e) => setNewPackage({ ...newPackage, userId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">اختر المستخدم</option>
                  {regularUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المتجر
                </label>
                <select
                  name="shopId"
                  value={newPackage.shopId}
                  onChange={(e) => setNewPackage({ ...newPackage, shopId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">اختر المتجر</option>
                  {shopUsers.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name} ({shop.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-center space-x-8 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
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