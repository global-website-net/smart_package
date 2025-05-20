'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'

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

export default function MyPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages/my-packages')
        if (!response.ok) {
          throw new Error('Failed to fetch packages')
        }
        const data = await response.json()
        setPackages(data)
      } catch (error) {
        console.error('Error fetching packages:', error)
        setError('حدث خطأ أثناء جلب الشحنات')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchPackages()
    }
  }, [status, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-gray-600">جاري تحميل الشحنات...</p>
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
            <h1 className="text-4xl font-bold mb-6">تتبع الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-8">
              {error}
            </div>
          )}

          {packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">لا توجد شحنات حالياً</p>
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