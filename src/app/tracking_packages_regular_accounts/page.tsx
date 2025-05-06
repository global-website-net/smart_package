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

interface Package {
  id: string
  trackingNumber: string
  status: string
  description?: string
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }[]
  shop: {
    fullName: string
    email: string
  }[]
}

export default function TrackingPackagesRegularPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'REGULAR') {
        router.push('/')
        return
      }
      fetchUserPackages()
    }
  }, [status])

  const fetchUserPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: packages, error } = await supabase
        .from('package')
        .select(`
          id,
          trackingNumber,
          userId,
          shopId,
          description,
          status,
          createdAt,
          updatedAt,
          User!userId (
            id,
            fullName,
            email
          ),
          shop:shopId (
            id,
            name,
            email
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform the data to match the Package interface
      const transformedPackages = packages.map(pkg => {
        const userData = pkg.User as unknown as { fullName: string; email: string } | null
        const shopData = pkg.shop as unknown as { name: string; email: string } | null

        return {
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          description: pkg.description,
          userId: pkg.userId,
          shopId: pkg.shopId,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          user: [{
            fullName: userData?.fullName || 'غير معروف',
            email: userData?.email || ''
          }],
          shop: [{
            fullName: shopData?.name || 'غير معروف',
            email: shopData?.email || ''
          }]
        }
      })

      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
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
            <h1 className="text-4xl font-bold mb-6">تتبع الطرود</h1>
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
                <TableHead className="text-center">رقم التتبع</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">الوصف</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">المتجر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    لا توجد طرود
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                        {getPackageStatusText(pkg.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{pkg.description || 'لا يوجد وصف'}</TableCell>
                    <TableCell className="text-center">{new Date(pkg.createdAt).toLocaleDateString('ar')}</TableCell>
                    <TableCell className="text-center">{pkg.shop?.[0]?.fullName || 'غير محدد'}</TableCell>
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