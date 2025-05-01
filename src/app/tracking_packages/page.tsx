'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import CreatePackageForm from '@/components/CreatePackageForm'

interface Package {
  id: string
  trackingNumber: string
  status: string
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

export default function TrackingPackagesPage() {
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null)
  const router = useRouter()

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
    const checkAuth = async () => {
      if (status === 'loading') return

      if (!session) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin or owner
      const userRole = session.user?.role
      if (!userRole || (userRole !== 'ADMIN' && userRole !== 'OWNER')) {
        router.push('/')
        return
      }

      try {
        // Fetch packages
        const response = await fetch('/api/packages/all')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch packages')
        }
        const data = await response.json()
        setPackages(data)
      } catch (error) {
        console.error('Error fetching packages:', error)
        setError(error instanceof Error ? error.message : 'حدث خطأ أثناء جلب الطلبات')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [status, session, router])

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
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-6">إدارة الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-64 md:w-80">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                إضافة طرد جديد
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {packages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد طرود حالياً</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم التتبع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستخدم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المتجر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {packages.map((pkg) => (
                      <tr key={pkg.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pkg.user.fullName}</div>
                          <div className="text-sm text-gray-500">{pkg.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.shop.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pkg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            pkg.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            pkg.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                            pkg.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(pkg.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/tracking_packages/${pkg.id}`)}
                            className="text-green-600 hover:text-green-900 ml-4"
                          >
                            عرض التفاصيل
                          </button>
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="text-blue-600 hover:text-blue-900 ml-4"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => setPackageToDelete(pkg)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Package Modal */}
      {showCreateForm && (
        <CreatePackageForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={(newPackage) => {
            setPackages([newPackage, ...packages])
            setShowCreateForm(false)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الطرد رقم {packageToDelete.trackingNumber}؟
            </p>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setPackages(packages.filter(p => p.id !== packageToDelete.id))
                  setPackageToDelete(null)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 