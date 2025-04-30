'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface SupabasePackage {
  id: string
  trackingNumber: string
  status: string
  location: string
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

interface Package {
  id: string
  trackingNumber: string
  status: string
  location: string
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

export default function TrackingOrdersRegularAccounts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'REGULAR') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchPackages()
    }
  }, [status, session, router])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('Package')
        .select(`
          id,
          trackingNumber,
          status,
          location,
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

      if (error) {
        console.error('Error fetching packages:', error)
        setError('حدث خطأ أثناء جلب الطلبات')
        return
      }

      if (data) {
        // Transform the data to match our Package interface
        const transformedData = data.map((pkg: any) => ({
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          location: pkg.location,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          user: {
            fullName: pkg.user?.[0]?.fullName || '',
            email: pkg.user?.[0]?.email || ''
          },
          shop: {
            fullName: pkg.shop?.[0]?.fullName || ''
          }
        })) as Package[]
        setPackages(transformedData)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('حدث خطأ أثناء جلب الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار'
      case 'IN_TRANSIT':
        return 'قيد التوصيل'
      case 'DELIVERED':
        return 'تم التوصيل'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">جاري التحميل...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-red-600">{error}</h2>
            <button
              onClick={fetchPackages}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">تتبع الطلبات</h2>
        </div>

        {packages.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-lg">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      رقم التتبع: {pkg.trackingNumber}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      الحالة: {getStatusText(pkg.status)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      الموقع: {pkg.location}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      المتجر: {pkg.shop.fullName}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>تاريخ الإنشاء: {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}</p>
                    <p>آخر تحديث: {new Date(pkg.updatedAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 