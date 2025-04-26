'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import { supabase } from '@/lib/supabase'
import CreatePackageForm from '@/components/CreatePackageForm'

interface Shop {
  id: string
  name: string
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  shopId: string
  shop: {
    fullName: string
  }
  createdAt: string
  updatedAt: string
  currentLocation: string
}

export default function TrackingPackagesPage() {
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedShop, setSelectedShop] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
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

          // Fetch shops
          const shopsResponse = await fetch('/api/shops')
          if (!shopsResponse.ok) {
            const errorData = await shopsResponse.json()
            if (errorData.error?.includes('relation "public.Shop" does not exist')) {
              setError('جدول المتاجر غير موجود. يرجى إنشاء الجدول أولاً.')
              return
            }
            throw new Error('Failed to fetch shops')
          }
          const shopsData = await shopsResponse.json()
          setShops(shopsData)

          // Fetch packages
          const packagesResponse = await fetch('/api/packages/all')
          if (!packagesResponse.ok) {
            throw new Error('Failed to fetch packages')
          }
          const packagesData = await packagesResponse.json()
          setPackages(packagesData)
          setIsAdminOrOwner(true)
        } catch (error) {
          console.error('Error:', error)
          setError('حدث خطأ أثناء جلب البيانات')
        } finally {
          setLoading(false)
        }
      }
    }

    checkAuth()
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShop || !trackingNumber) return

    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: selectedShop,
          trackingNumber,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add package')
      }

      const newPackage = await response.json()
      setPackages([...packages, newPackage])
      setTrackingNumber('')
      setSelectedShop('')
    } catch (err) {
      console.error('Error adding package:', err)
      setError('حدث خطأ أثناء إضافة الشحنة')
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-red-100 text-red-700 p-6 rounded-md">
              <h2 className="text-xl font-bold mb-4">خطأ في قاعدة البيانات</h2>
              <p className="mb-4">{error}</p>
              {error.includes('جدول المتاجر غير موجود') && (
                <div className="mt-4">
                  <p className="mb-2">يجب إنشاء جدول المتاجر في قاعدة البيانات. يمكنك اتباع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mb-4 space-y-2">
                    <li>قم بتسجيل الدخول إلى لوحة تحكم Supabase</li>
                    <li>انتقل إلى قسم "Table Editor"</li>
                    <li>انقر على "New Table"</li>
                    <li>قم بإنشاء جدول باسم "Shop" مع الأعمدة التالية:
                      <ul className="list-disc list-inside mr-6 mt-2 space-y-1">
                        <li>id (uuid, primary key)</li>
                        <li>name (text, not null)</li>
                        <li>createdAt (timestamp with time zone, default: now())</li>
                        <li>updatedAt (timestamp with time zone, default: now())</li>
                      </ul>
                    </li>
                    <li>انقر على "Save" لحفظ الجدول</li>
                  </ol>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    تحديث الصفحة
                  </button>
                </div>
              )}
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
                        {pkg.shop?.fullName || 'متجر غير معروف'}
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