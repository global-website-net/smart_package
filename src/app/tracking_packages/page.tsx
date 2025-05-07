'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import CreatePackageForm from '@/components/CreatePackageForm'
import EditPackageModal from '@/app/components/EditPackageModal'
import { Badge } from '@/components/ui/badge'
import AsyncSelect from 'react-select/async'

interface User {
  id: string
  fullName: string
  email: string
}

interface UserOption {
  value: string
  label: string
  id: string
  fullName: string
  email: string
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  description: string | null
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string
    email: string
  }
  shop: {
    id: string
    fullName: string
    email: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    id: string
    fullName: string
    email: string
  }
}

interface Shop {
  id: string
  fullName: string
  email: string
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
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session) {
      console.log('User authenticated:', {
        role: session.user?.role,
        email: session.user?.email,
        id: session.user?.id
      })

      if (session.user?.role === 'ADMIN' || session.user?.role === 'OWNER') {
        setIsAdminOrOwner(true)
        fetchPackages()
        fetchShops()
        fetchRegularUsers()
      } else {
        router.push('/')
      }
    }
  }, [status, session])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('package')
        .select(`
          id,
          trackingNumber,
          status,
          description,
          userId,
          shopId,
          createdAt,
          updatedAt,
          user:User!userId (
            id,
            fullName,
            email
          ),
          shop:User!shopId (
            id,
            fullName,
            email
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform the data to match the Package interface
      const transformedPackages = (data || []).map(pkg => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        description: pkg.description,
        userId: pkg.userId,
        shopId: pkg.shopId,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        user: {
          id: pkg.user[0]?.id || '',
          fullName: pkg.user[0]?.fullName || 'غير معروف',
          email: pkg.user[0]?.email || ''
        },
        shop: {
          id: pkg.shop[0]?.id || '',
          fullName: pkg.shop[0]?.fullName || 'غير معروف',
          email: pkg.shop[0]?.email || ''
        }
      }))

      setPackages(transformedPackages)
    } catch (err) {
      console.error('Error fetching packages:', err)
      setError('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'SHOP')
        .order('fullName')

      if (error) throw error

      setShops(data || [])
    } catch (err) {
      console.error('Error fetching shops:', err)
      setError('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchRegularUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'REGULAR')
        .order('fullName')

      if (error) throw error

      setRegularUsers(data || [])
    } catch (err) {
      console.error('Error fetching regular users:', err)
      setError('حدث خطأ أثناء جلب المستخدمين')
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
        .select('id')

      if (packagesError) {
        console.error('Error fetching packages:', packagesError)
        throw packagesError
      }

      // Filter out orders that already have packages
      const usedOrderIds = new Set(packages?.map(p => p.id) || [])
      const availableOrders = orders?.filter(order => !usedOrderIds.has(order.id)) || []
      
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

  const handleEditClick = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsEditModalOpen(true)
  }

  const handleSavePackage = (updatedPackage: {
    id: string
    trackingNumber: string
    status: string
    description: string | null
    shopId: string
    userId: string
  }) => {
    setPackages(prevPackages => 
      prevPackages.map(pkg => {
        if (pkg.id === updatedPackage.id) {
          // Find the new user data from regularUsers array
          const newUser = regularUsers.find(user => user.id === updatedPackage.userId)
          
          return {
            ...pkg,
            ...updatedPackage,
            user: newUser ? {
              id: newUser.id,
              fullName: newUser.fullName,
              email: newUser.email
            } : { id: '', fullName: 'غير معروف', email: '' }
          }
        }
        return pkg
      })
    )
    setEditingPackage(null)
    setIsEditModalOpen(false)
  }

  const getPackageStatusText = (status: string) => {
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

  // Function to load users with search
  const loadUsers = async (inputValue: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .or(`fullName.ilike.%${inputValue}%,email.ilike.%${inputValue}%`)
        .limit(10)
        .order('fullName')

      if (error) throw error

      return data.map(user => ({
        value: user.id,
        label: `${user.fullName} (${user.email})`,
        ...user
      }))
    } catch (error) {
      console.error('Error loading users:', error)
      return []
    }
  }

  const handleCreatePackage = async () => {
    if (!selectedUser) return

    try {
      // Generate a unique tracking number
      const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { data, error } = await supabase
        .from('package')
        .insert([
          {
            trackingNumber,
            status: 'PENDING',
            description: '',
            userId: selectedUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select(`
          *,
          user:User (
            fullName,
            email
          )
        `)
        .single()

      if (error) throw error

      setPackages([data, ...packages])
      setIsModalOpen(false)
      setSelectedUser(null)
      toast.success('تم إنشاء الطرد بنجاح')
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error('حدث خطأ أثناء إنشاء الطرد')
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
            <h1 className="text-4xl font-bold mb-6">إدارة الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') && (
              <div className="mt-6">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  إضافة طرد جديد
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>الطرود</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">رقم التتبع</TableHead>
                    <TableHead className="text-center">المستخدم</TableHead>
                    <TableHead className="text-center">المتجر</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                      <TableCell className="text-center">{pkg.user.fullName}</TableCell>
                      <TableCell className="text-center">{pkg.shop.fullName}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(pkg.status)}>
                          {getPackageStatusText(pkg.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleEditClick(pkg)}
                            variant="outline"
                            size="sm"
                          >
                            تعديل
                          </Button>
                          <Button
                            onClick={() => handleDelete(pkg.id)}
                            variant="destructive"
                            size="sm"
                          >
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {isEditModalOpen && selectedPackage && (
        <EditPackageModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedPackage(null)
          }}
          pkg={selectedPackage}
          shops={shops}
          users={regularUsers}
          onSave={handleSavePackage}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-6 text-center">إضافة طرد جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستخدم
                </label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  value={selectedUser}
                  onChange={(selected: UserOption | null) => setSelectedUser(selected)}
                  loadOptions={loadUsers}
                  placeholder="اختر المستخدم..."
                  className="w-full"
                  classNamePrefix="select"
                  isRtl
                  noOptionsMessage={() => "لا توجد نتائج"}
                  loadingMessage={() => "جاري التحميل..."}
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedUser(null)
                  }}
                  variant="outline"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleCreatePackage}
                  disabled={!selectedUser}
                  className="bg-green-500 hover:bg-green-600"
                >
                  إنشاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 