'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import { supabase } from '@/lib/supabase'
import { Package } from '@/types'
import CreatePackageForm from '@/components/CreatePackageForm'

export default function TrackingPackagesPage() {
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/login')
        return
      }

      if (status === 'authenticated' && session?.user?.email) {
        try {
          // Check if user is admin or owner
          const { data: user, error: userError } = await supabase
            .from('User')
            .select('role')
            .eq('email', session.user.email)
            .single()

          if (userError) {
            console.error('Error checking user role:', userError)
            setError('حدث خطأ أثناء التحقق من الصلاحيات')
            return
          }

          if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
            router.push('/')
            return
          }

          // Fetch packages
          const response = await fetch('/api/packages/all')
          if (!response.ok) {
            throw new Error('Failed to fetch packages')
          }
          const data = await response.json()
          setPackages(data.packages)
          setIsAdminOrOwner(true)
        } catch (error) {
          console.error('Error:', error)
          setError('حدث خطأ أثناء جلب الشحنات')
        } finally {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [status, session, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-gray-600">جاري تحميل الشحنات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-center mb-8">إدارة الشحنات</h1>
            {isAdminOrOwner && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                إضافة شحنة جديدة
              </button>
            )}
          </div>

          {showCreateForm && (
            <CreatePackageForm onClose={() => setShowCreateForm(false)} />
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم التتبع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المتجر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الموقع الحالي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آخر تحديث
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
                        {pkg.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.shop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.currentLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pkg.updatedAt).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 