'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Package {
  id: string
  trackingNumber: string
  status: string
  currentLocation?: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
  shop: {
    fullName: string
  }
}

interface SupabasePackage {
  id: string
  trackingNumber: string
  status: string
  currentLocation?: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }[]
  shop: {
    fullName: string
  }[]
}

export default function TrackingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchPackages()
    }
  }, [status, session])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('Package')
        .select(`
          id,
          trackingNumber,
          status,
          currentLocation,
          createdAt,
          updatedAt,
          user:userId (
            fullName,
            email
          ),
          shop:shopId (
            fullName
          )
        `)
        .eq('userId', session?.user?.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform the data to match the Package interface
      const transformedData: Package[] = (data || []).map(pkg => ({
        ...pkg,
        user: pkg.user?.[0] || { fullName: '', email: '' },
        shop: pkg.shop?.[0] || { fullName: '' }
      }))

      setPackages(transformedData)
    } catch (err) {
      console.error('Error fetching packages:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار'
      case 'PROCESSING':
        return 'قيد المعالجة'
      case 'SHIPPED':
        return 'تم الشحن'
      case 'DELIVERED':
        return 'تم التسليم'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return status
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">
              {session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER' 
                ? 'ادارة الطلبات' 
                : 'تتبع الطلبات'}
            </h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            {session?.user?.role === 'REGULAR' && (
              <div className="mt-6">
                <Link
                  href="/new-order"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  طلب جديد
                </Link>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {packages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">رقم التتبع</p>
                      <p className="font-medium">{pkg.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الحالة</p>
                      <p className="font-medium">{getStatusText(pkg.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الموقع الحالي</p>
                      <p className="font-medium">{pkg.currentLocation || 'غير متوفر'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المتجر</p>
                      <p className="font-medium">{pkg.shop?.fullName || 'غير متوفر'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                      <p className="font-medium">{new Date(pkg.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">آخر تحديث</p>
                      <p className="font-medium">{new Date(pkg.updatedAt).toLocaleDateString('ar-SA')}</p>
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