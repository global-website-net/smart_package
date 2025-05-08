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
import EditPackageModal from '@/app/components/EditPackageModal'
import { Badge } from '@/components/ui/badge'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)

interface User {
  id: string
  fullName: string
  email: string
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

function getStatusVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'secondary'
    case 'IN_TRANSIT':
      return 'info'
    case 'DELIVERED':
      return 'success'
    case 'CANCELLED':
      return 'destructive'
    case 'RETURNED':
      return 'secondary'
    default:
      return 'default'
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
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [users, setUsers] = useState<User[]>([])

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

      // Initialize Supabase with the session
      const initializeSupabase = async () => {
        try {
          if (session.user?.role === 'ADMIN' || session.user?.role === 'OWNER') {
            setIsAdminOrOwner(true)
            await fetchPackages()
            await fetchShops()
            await fetchRegularUsers()
          } else {
            router.push('/')
          }
        } catch (error) {
          console.error('Error initializing Supabase:', error)
        }
      }

      initializeSupabase()
    }
  }, [status, session])

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      setError('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchRegularUsers = async () => {
    try {
      const response = await fetch('/api/users/regular')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setRegularUsers(data)
    } catch (error) {
      console.error('Error fetching regular users:', error)
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

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/packages')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      
      const packages = await response.json()
      console.log('Fetched packages:', packages)

      if (!packages || packages.length === 0) {
        console.log('No packages found in the database')
        setPackages([])
        return
      }

      // Transform the data to match the Package interface
      const transformedPackages = packages.map((pkg: any) => {
        const shopData = Array.isArray(pkg.shop) ? pkg.shop[0] : pkg.shop
        const userData = Array.isArray(pkg.User) ? pkg.User[0] : pkg.User

        return {
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          description: pkg.description,
          shopId: pkg.shopId,
          userId: pkg.userId,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          shop: {
            id: shopData?.id || '',
            fullName: shopData?.fullName || 'غير معروف',
            email: shopData?.email || ''
          },
          user: {
            id: userData?.id || '',
            fullName: userData?.fullName || 'غير معروف',
            email: userData?.email || ''
          }
        }
      })

      console.log('Transformed packages:', transformedPackages)
      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error in fetchPackages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
      toast.error('حدث خطأ أثناء جلب الطرود')
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
                  onClick={() => setShowCreateForm(true)}
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right font-bold text-lg">رقم التتبع</TableHead>
                <TableHead className="text-right font-bold text-lg">الحالة</TableHead>
                <TableHead className="text-right font-bold text-lg">الوصف</TableHead>
                <TableHead className="text-right font-bold text-lg">المتجر</TableHead>
                <TableHead className="text-right font-bold text-lg">المستخدم</TableHead>
                <TableHead className="text-right font-bold text-lg">تاريخ الإنشاء</TableHead>
                {isAdminOrOwner && <TableHead className="text-right font-bold text-lg">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdminOrOwner ? 7 : 6} className="text-center py-8">
                    لا توجد طلبات متابعة حالياً
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="text-right">{pkg.trackingNumber}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                        {getPackageStatusText(pkg.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{pkg.description || '-'}</TableCell>
                    <TableCell className="text-right">{pkg.shop?.email || 'غير معروف'}</TableCell>
                    <TableCell className="text-right">{pkg.user?.email || '-'}</TableCell>
                    <TableCell className="text-right">{new Date(pkg.createdAt).toLocaleDateString('ar')}</TableCell>
                    {isAdminOrOwner && (
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleEditClick(pkg)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          تعديل
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
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

      {isEditModalOpen && selectedPackage && (
        <EditPackageModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          pkg={selectedPackage}
          onSave={(updatedPackage) => {
            setPackages(packages.map(pkg => 
              pkg.id === updatedPackage.id ? {
                ...pkg,
                trackingNumber: updatedPackage.trackingNumber,
                status: updatedPackage.status,
                description: updatedPackage.description,
                shopId: updatedPackage.shopId,
                userId: updatedPackage.userId
              } : pkg
            ))
          }}
          shops={shops}
          users={regularUsers}
        />
      )}
    </div>
  )
} 