'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface SupabasePackage {
  id: string
  trackingNumber: string
  status: string
  description: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }[]
  shop: {
    name: string
  }[]
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  description: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
  shop: {
    name: string
  }
}

export default function TrackingOrdersRegularAccounts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchPackages()
    }
  }, [status, router])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('package')
        .select(`
          id,
          trackingNumber,
          status,
          description,
          createdAt,
          updatedAt,
          user:User (
            fullName,
            email
          ),
          shop:Shop (
            name
          )
        `)
        .eq('userId', session?.user?.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      if (data) {
        // Transform the data to match our Package interface
        const transformedData = data.map((pkg: any) => ({
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          description: pkg.description,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          user: {
            fullName: pkg.user?.[0]?.fullName || '',
            email: pkg.user?.[0]?.email || ''
          },
          shop: {
            name: pkg.shop?.[0]?.name || ''
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900">تتبع الطلبات</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم التتبع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المتجر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوصف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.trackingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.shop.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          pkg.status === 'DELIVERED' 
                            ? 'bg-green-100 text-green-800'
                            : pkg.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusText(pkg.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pkg.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        لا توجد طلبات حتى الآن
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 