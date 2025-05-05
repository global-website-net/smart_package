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
import { EditPackageModal } from '@/app/components/EditPackageModal'

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

interface User {
  id: string
  name: string
}

interface Shop {
  id: string
  name: string
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  description: string | null
  shopId: string
  userId: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  shop: Shop
  user: User
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
          // First, let's verify we can access the package table directly
          const { data: directPackages, error: directError } = await supabase
            .from('package')
            .select('*')
            .limit(1)

          console.log('Direct package access:', { directPackages, directError })

          if (directError) {
            console.error('Error accessing package table:', directError)
            return
          }

          const { data: { session: supabaseSession }, error } = await supabase.auth.getSession()
          console.log('Current Supabase session:', supabaseSession)
          
          if (error) {
            console.error('Error getting Supabase session:', error)
            return
          }

          if (session.user?.role === 'ADMIN' || session.user?.role === 'OWNER') {
            await fetchPackages()
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

  useEffect(() => {
    fetchPackages()
    fetchShops()
    fetchUsers()
  }, [])

  const checkAdminOrOwner = () => {
    if (session && session.user && session.user.role) {
      setIsAdminOrOwner(session.user.role === 'ADMIN' || session.user.role === 'OWNER')
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      const transformedShops = data.map((shop: any) => ({
        id: shop.id,
        name: shop.name
      }))
      setShops(transformedShops)
    } catch (error) {
      console.error('Error fetching shops:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      const transformedUsers = data.map((user: { id: string; name: string }) => ({
        id: user.id,
        name: user.name
      }))
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
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
      const transformedPackages: Package[] = packages.map((pkg: any) => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        description: pkg.description,
        shopId: pkg.shopId,
        userId: pkg.userId,
        orderNumber: pkg.orderNumber,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        shop: {
          id: pkg.shop?.id || '',
          name: pkg.shop?.name || 'غير معروف'
        },
        user: {
          id: pkg.user?.id || '',
          name: pkg.user?.name || 'غير معروف'
        }
      }))

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
  }) => {
    setPackages(packages.map(pkg => 
      pkg.id === updatedPackage.id 
        ? { ...pkg, ...updatedPackage }
        : pkg
    ))
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
                <TableHead className="text-center">رقم التتبع</TableHead>
                <TableHead className="text-center">رقم الطلب</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">الوصف</TableHead>
                <TableHead className="text-center">المتجر</TableHead>
                <TableHead className="text-center">المستخدم</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') && (
                  <TableHead className="text-center">الإجراءات</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    لا توجد طرود
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                    <TableCell className="text-center">{pkg.orderNumber}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                        {getPackageStatusText(pkg.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{pkg.description || '-'}</TableCell>
                    <TableCell className="text-center">{pkg.shop.name || 'غير معروف'}</TableCell>
                    <TableCell className="text-center">{pkg.user.name || 'غير معروف'}</TableCell>
                    <TableCell className="text-center">{new Date(pkg.createdAt).toLocaleDateString('ar')}</TableCell>
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') && (
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-4 rtl:space-x-reverse">
                          <button
                            onClick={() => handleEditClick(pkg)}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                          >
                            تعديل
                          </button>
                        </div>
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

      {selectedPackage && (
        <EditPackageModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          package={selectedPackage}
          onSave={handleSavePackage}
          shops={shops}
          users={users}
        />
      )}
    </div>
  )
} 