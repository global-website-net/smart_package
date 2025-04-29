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
    name: string
  }
  createdAt: string
  updatedAt: string
  currentLocation: string
  scannerCode?: string
  qrCode?: string
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
      if (userRole !== 'ADMIN' && userRole !== 'OWNER') {
        router.push('/auth/login')
        return
      }

      setIsAdminOrOwner(true)

      try {
        // Fetch shops
        const shopsResponse = await fetch('/api/shops')
        if (!shopsResponse.ok) {
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
      } catch (error) {
        console.error('Error:', error)
        setError('حدث خطأ أثناء جلب البيانات')
      } finally {
        setLoading(false)
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

  const handleDelete = async (packageId: string) => {
    const packageToDelete = packages.find(pkg => pkg.id === packageId)
    if (packageToDelete) {
      setPackageToDelete(packageToDelete)
    }
  }

  const confirmDelete = async () => {
    if (!packageToDelete) return

    try {
      const response = await fetch(`/api/packages/${packageToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete package')
      }

      setPackages(packages.filter(pkg => pkg.id !== packageToDelete.id))
      setPackageToDelete(null)
    } catch (error) {
      console.error('Error deleting package:', error)
      setError('حدث خطأ أثناء حذف الشحنة')
    }
  }

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg)
  }

  const handleUpdatePackage = async (updatedPackage: Package) => {
    try {
      const response = await fetch(`/api/packages/${updatedPackage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPackage),
      })

      if (!response.ok) {
        throw new Error('Failed to update package')
      }

      const updated = await response.json()
      setPackages(packages.map(pkg => pkg.id === updated.id ? updated : pkg))
      setEditingPackage(null)
    } catch (error) {
      console.error('Error updating package:', error)
      setError('حدث خطأ أثناء تحديث الشحنة')
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
                      QR
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المتجر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آخر تحديث
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.qrCode ? (
                          <img 
                            src={pkg.qrCode} 
                            alt={`QR Code for ${pkg.trackingNumber}`} 
                            className="w-16 h-16"
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getStatusText(pkg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.shop?.name || 'متجر غير معروف'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pkg.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pkg.updatedAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {editingPackage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">تعديل الشحنة</h2>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdatePackage(editingPackage)
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم التتبع
                      </label>
                      <input
                        type="text"
                        value={editingPackage.trackingNumber}
                        onChange={(e) => setEditingPackage({ ...editingPackage, trackingNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالة
                      </label>
                      <select
                        value={editingPackage.status}
                        onChange={(e) => setEditingPackage({ ...editingPackage, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="PENDING">قيد الانتظار</option>
                        <option value="PROCESSING">قيد المعالجة</option>
                        <option value="SHIPPED">تم الشحن</option>
                        <option value="DELIVERED">تم التسليم</option>
                        <option value="CANCELLED">ملغي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الموقع الحالي
                      </label>
                      <input
                        type="text"
                        value={editingPackage.currentLocation}
                        onChange={(e) => setEditingPackage({ ...editingPackage, currentLocation: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      حفظ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {packageToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
                <p className="mb-6">هل أنت متأكد من حذف الشحنة برقم التتبع <span className="font-bold">{packageToDelete.trackingNumber}</span>؟</p>
                <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => setPackageToDelete(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 