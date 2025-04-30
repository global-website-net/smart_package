'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

// Define types for package data
interface PackageHistoryItem {
  status: string
  location: string
  timestamp: string
}

interface PackageData {
  trackingNumber: string
  status: string
  currentLocation: string
  lastUpdated: string
  history: PackageHistoryItem[]
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setPackageData(null)

    try {
      const response = await fetch('/api/packages/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to track package')
      }

      const data = await response.json() as PackageData
      setPackageData(data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while tracking your package'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">تتبع الطرود</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم التتبع
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل رقم التتبع"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'جاري التتبع...' : 'تتبع الطرد'}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
          
          {packageData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">معلومات الطرد</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">رقم التتبع</p>
                  <p className="font-medium">{packageData.trackingNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className="font-medium">{packageData.status}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">الموقع الحالي</p>
                  <p className="font-medium">{packageData.currentLocation}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">تاريخ آخر تحديث</p>
                  <p className="font-medium">{new Date(packageData.lastUpdated).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              
              {packageData.history && packageData.history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">سجل التتبع</h3>
                  <div className="space-y-3">
                    {packageData.history.map((item: PackageHistoryItem, index: number) => (
                      <div key={index} className="border-r-2 border-green-500 pr-4 pb-3">
                        <p className="font-medium">{item.status}</p>
                        <p className="text-sm text-gray-600">{item.location}</p>
                        <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString('ar-SA')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 