'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import ShopEditWizard from '@/app/components/ShopEditWizard'
import { Edit2 } from 'lucide-react'

interface Shop {
  id: string
  fullName: string
  email: string
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  shopId: string
  description: string | null
  userId: string
  createdAt: string
  updatedAt: string
  User: Shop
}

// Add a hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function UserPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [isShopEditOpen, setIsShopEditOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const isMobile = useIsMobile()
  const canEditShop = true // Set to true to show the edit shop button

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session) {
      if (session.user.role !== 'REGULAR') {
        router.push('/')
        return
      }
      fetchPackages()
      fetchShops()
    }
  }, [status, session])

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/packages')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      
      const packages = await response.json()
      console.log('Fetched packages:', packages)

      if (!packages || packages.length === 0) {
        console.log('No packages found for user')
        setPackages([])
        return
      }

      // Transform the data to match the Package interface
      const transformedPackages = packages.map((pkg: any) => {
        const shopData = Array.isArray(pkg.shop) ? pkg.shop[0] : pkg.shop
        return {
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          description: pkg.description,
          shopId: pkg.shopId,
          userId: pkg.userId,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          User: shopData || { fullName: 'غير محدد', email: '' }
        }
      })

      console.log('Transformed packages:', transformedPackages)
      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error in fetchPackages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const handleShopChange = async (newShopId: string) => {
    if (!selectedPackageId) return

    try {
      setUpdating(true)
      setError(null)

      // Update the package in Supabase
      const { data, error: updateError } = await supabase
        .from('package')
        .update({ 
          shopId: newShopId,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedPackageId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating package:', updateError)
        throw new Error('حدث خطأ أثناء تحديث المتجر')
      }

      if (!data) {
        throw new Error('لم يتم العثور على الطرد')
      }

      // Get the updated shop data
      const selectedShop = shops.find(shop => shop.id === newShopId)
      if (!selectedShop) {
        throw new Error('لم يتم العثور على بيانات المتجر')
      }

      // Update the local state with the new shop
      setPackages(packages.map(pkg => 
        pkg.id === selectedPackageId 
          ? { 
              ...pkg, 
              shopId: newShopId,
              User: selectedShop
            }
          : pkg
      ))

      toast.success('تم تحديث المتجر بنجاح')
      setIsShopEditOpen(false)
      setSelectedPackageId(null)
    } catch (error) {
      console.error('Error in handleShopChange:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المتجر')
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المتجر')
    } finally {
      setUpdating(false)
    }
  }

  const handleViewDetails = (pkg: Package) => {
    console.log('Viewing details for package:', pkg)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع'
      case 'PREPARING':
        return 'قيد التحضير'
      case 'DELIVERING_TO_SHOP':
        return 'قيد التوصيل للمتجر'
      case 'IN_SHOP':
        return 'في المتجر'
      case 'RECEIVED':
        return 'تم الاستلام'
      case 'PENDING':
        return 'قيد الانتظار'
      case 'IN_TRANSIT':
        return 'قيد الشحن'
      case 'DELIVERED':
        return 'تم التسليم'
      case 'CANCELLED':
        return 'ملغي'
      case 'RETURNED':
        return 'تم الإرجاع'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800'
      case 'RETURNED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleEditShop = (pkg: any) => {
    // Implement shop edit logic here if needed
  }

  if (loading) {
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
        <div className="max-w-6xl mx-auto">
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
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Mobile Card Layout */}
          {isMobile ? (
            <div className="flex flex-col gap-6">
              {packages.length === 0 ? (
                <div className="text-center py-8">لا توجد طرود</div>
              ) : (
                packages.map((pkg, idx) => (
                  <div key={pkg.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">طرد</span>
                      <span className="font-bold text-lg">#{String(idx + 1).padStart(3, '0')}</span>
                    </div>
                    <div className="mb-2 text-gray-600 text-sm">رقم التتبع: <span className="font-mono">{pkg.trackingNumber}</span></div>
                    <div className="my-4">
                      {/* Generic package icon */}
                      <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><rect width="100%" height="100%" rx="8" fill="#F3F4F6"/><path d="M3 7l9-4 9 4M4 8v8a2 2 0 001 1.73l7 4.2a2 2 0 002 0l7-4.2A2 2 0 0020 16V8M4 8l8 4.5M20 8l-8 4.5" stroke="#222" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pkg.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {getStatusText(pkg.status)}
                      </span>
                    </div>
                    <div className="mb-2 text-gray-500 text-sm">تاريخ الإنشاء: {new Date(pkg.createdAt).toLocaleDateString('ar')}</div>
                    {/* Edit shop button if allowed */}
                    {canEditShop && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 flex items-center gap-1"
                        onClick={() => handleEditShop(pkg)}
                      >
                        <Edit2 className="w-4 h-4" /> تعديل المتجر
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-bold text-lg">رقم التتبع</TableHead>
                  <TableHead className="text-center font-bold text-lg">المتجر</TableHead>
                  <TableHead className="text-center font-bold text-lg">الحالة</TableHead>
                  <TableHead className="text-center font-bold text-lg">الوصف</TableHead>
                  <TableHead className="text-center font-bold text-lg">تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      لا توجد طرود
                    </TableCell>
                  </TableRow>
                ) :
                  packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{pkg.User?.fullName || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                          {getStatusText(pkg.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{pkg.description || '-'}</TableCell>
                      <TableCell className="text-center">
                        {new Date(pkg.createdAt).toLocaleDateString('ar')}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <ShopEditWizard
        isOpen={isShopEditOpen}
        onClose={() => {
          setIsShopEditOpen(false)
          setSelectedPackageId(null)
        }}
        currentShopId={selectedPackageId ? packages.find(p => p.id === selectedPackageId)?.shopId || '' : ''}
        shops={shops}
        onSave={handleShopChange}
      />
    </div>
  )
} 