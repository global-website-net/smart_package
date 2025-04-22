'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

interface Package {
  id: string
  trackingNumber: string
  status: string
  currentLocation: string
  lastUpdated: string
}

export default function MyPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages/my-packages')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch packages')
        }

        const data = await response.json()
        setPackages(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching your packages'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchPackages()
    }
  }, [status])

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">طرودي</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-gray-600">جاري تحميل طرودك...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">لا توجد طرود حالياً</p>
              <a href="/packages" className="text-green-500 hover:text-green-600 font-medium">
                استكشف باقاتنا
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">{pkg.trackingNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      pkg.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      pkg.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      pkg.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      pkg.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pkg.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">الموقع الحالي</p>
                    <p className="font-medium">{pkg.currentLocation}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">آخر تحديث</p>
                    <p className="font-medium">{new Date(pkg.lastUpdated).toLocaleDateString('ar-SA')}</p>
                  </div>
                  
                  <a 
                    href={`/track?number=${pkg.trackingNumber}`}
                    className="block w-full text-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                  >
                    تتبع الطرد
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 