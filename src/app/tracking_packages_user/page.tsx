'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/components/Header'
import ShopEditWizard from '@/app/components/ShopEditWizard'
import { Edit2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

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
  const [trackingNumberFilter, setTrackingNumberFilter] = useState('')
  const [shopFilter, setShopFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const isMobile = useIsMobile()
  const canEditShop = true // Set to true to show the edit shop button
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

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

      // Call the API route to update the shop
      const response = await fetch('/api/packages/update-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackageId,
          newShopId: newShopId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'حدث خطأ أثناء تحديث المتجر')
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
      case 'RECEIVED':
        return 'bg-green-100 text-green-700'
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

  const filteredPackages = packages.filter(pkg => {
    const matchesTrackingNumber = trackingNumberFilter === '' || pkg.trackingNumber.includes(trackingNumberFilter)
    const matchesShop = shopFilter === 'ALL' || shopFilter === '' || pkg.shopId === shopFilter
    const matchesStatus = statusFilter === 'ALL' || statusFilter === '' || pkg.status === statusFilter
    return matchesTrackingNumber && matchesShop && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPackages = filteredPackages.slice(startIndex, endIndex)
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  // Collect unique shop names and statuses for filters
  const shopOptions = shops.map(shop => ({ value: shop.id, label: shop.fullName }))
  const statusOptions = Array.from(new Set(packages.map(pkg => pkg.status)))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-2">تتبع الرزم</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        {/* Filter icon and panel */}
        <div className="flex flex-col items-center mb-4">
          <button
            className="focus:outline-none"
            onClick={() => setShowDesktopFilters(v => !v)}
            aria-label="عرض الفلاتر"
            type="button"
          >
            <Image src="/images/filter_icon.png" alt="فلتر" width={32} height={32} />
          </button>
          {showDesktopFilters && (
            <div className="flex flex-col md:flex-row gap-4 mt-4 items-center bg-white p-4 rounded-lg shadow border border-gray-200 w-full md:w-auto max-w-xl">
              <input
                type="text"
                placeholder="ابحث برقم التتبع"
                className="w-full md:w-64 text-right p-2 border rounded"
                value={trackingNumberFilter}
                onChange={e => setTrackingNumberFilter(e.target.value)}
              />
              <select
                className="w-full md:w-48 text-right p-2 border rounded"
                value={shopFilter}
                onChange={e => setShopFilter(e.target.value)}
              >
                <option value="ALL">كل المتاجر</option>
                {shopOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                className="w-full md:w-48 text-right p-2 border rounded"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">كل الحالات</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {/* No packages found message */}
        {currentPackages.length === 0 && (
          <div className="text-center text-lg text-gray-500 my-8">لا توجد طرود</div>
        )}
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {currentPackages.map((pkg) => {
            const isSpecialStatus = getStatusText(pkg.status) !== 'في انتظار الدفع' && getStatusText(pkg.status) !== 'في انتظار الموافقة';
            return (
              <div key={pkg.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-full max-w-xs min-h-[320px] relative">
                {/* Left-side icon for special statuses */}
                {isSpecialStatus && (
                  <img
                    src="/images/price_hex_icon.png"
                    alt="Status Icon"
                    className="absolute left-[-28px] top-1/2 -translate-y-1/2 w-10 h-10 hidden md:block"
                  />
                )}
                {/* Title */}
                <div className="flex items-center justify-center text-lg font-bold mb-2">
                  <span>طرد</span>
                  <span className="mx-2">|</span>
                  <span className="ltr:font-mono rtl:font-mono">{pkg.trackingNumber}</span>
                </div>
                {/* Icon */}
                <img
                  src="/images/package_icon.png"
                  alt="Package Icon"
                  className="w-16 h-16 my-2 cursor-pointer"
                  onClick={() => router.push(`/tracking_packages_user/${pkg.id}`)}
                  title="عرض تفاصيل الطرد"
                />
                {/* Status as pill/badge */}
                <div className="flex justify-center my-2">
                  <span className={getStatusColor(pkg.status) + ' px-4 py-1 rounded-full text-base font-bold'}>{getStatusText(pkg.status)}</span>
                </div>
                {/* Creation date - move here under status */}
                <div className="text-sm text-gray-500">{new Date(pkg.createdAt).toLocaleDateString('en-US')}</div>
                {/* Payment button if needed */}
                {pkg.status === 'AWAITING_PAYMENT' && (
                  <button
                    className="mt-2 mb-2 px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
                    // onClick={() => handlePaymentClick(pkg)}
                  >
                    دفع
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {/* Mobile/table fallback: keep existing table or list */}
        {isMobile && (
          <div className="flex flex-col gap-6">
            {/* Mobile Filters Icon */}
            <div className="flex justify-start mb-4">
              <button
                className="p-0 bg-transparent border-none shadow-none"
                style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                onClick={() => setShowMobileFilters(v => !v)}
                aria-label="عرض الفلاتر"
              >
                <Filter className="w-7 h-7 text-black" fill="black" />
              </button>
            </div>
            {showMobileFilters && (
              <div className="flex flex-col gap-3 mb-4 p-4 bg-white rounded-lg shadow border border-gray-200">
                <input
                  type="text"
                  placeholder="ابحث برقم التتبع"
                  className="w-full md:w-64 text-right p-2 border rounded"
                  value={trackingNumberFilter}
                  onChange={e => setTrackingNumberFilter(e.target.value)}
                />
                <select
                  className="w-full md:w-48 text-right p-2 border rounded"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="AWAITING_PAYMENT">في انتظار الدفع</option>
                  <option value="PREPARING">قيد التحضير</option>
                  <option value="DELIVERING_TO_SHOP">قيد التوصيل للمتجر</option>
                  <option value="IN_SHOP">في المتجر</option>
                  <option value="RECEIVED">تم الاستلام</option>
                </select>
                <select
                  className="w-full md:w-48 text-right p-2 border rounded"
                  value={shopFilter}
                  onChange={e => setShopFilter(e.target.value)}
                >
                  <option value="ALL">كل المتاجر</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.fullName}</option>
                  ))}
                </select>
              </div>
            )}
            {currentPackages.length === 0 ? (
              <div className="text-center py-8">لا توجد طرود</div>
            ) : (
              currentPackages.map((pkg, idx) => (
                <div key={pkg.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-200">
                  {/* Package Card Title */}
                  <div className="flex items-center justify-center gap-2 text-xl font-bold mb-2">
                    <span>طرد</span>
                    <span className="mx-1">|</span>
                    <span>#{idx + 1}</span>
                  </div>
                  <div className="mb-2 text-gray-600 text-sm">رقم التتبع: <span className="font-mono">{pkg.trackingNumber}</span></div>
                  <div className="my-4 text-5xl text-center">
                    📦
                  </div>
                  <div className="mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pkg.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {getStatusText(pkg.status)}
                    </span>
                  </div>
                  <div className="mb-2 text-gray-500 text-sm">تاريخ الإنشاء: {new Date(pkg.createdAt).toLocaleDateString('ar')}</div>
                  {/* Edit shop button and current shop */}
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      {pkg.status !== 'RECEIVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 flex items-center gap-1"
                          onClick={() => {
                            setSelectedPackageId(pkg.id)
                            setIsShopEditOpen(true)
                          }}
                        >
                          <Edit2 className="w-4 h-4" /> تعديل المتجر
                        </Button>
                      )}
                      <span className="text-sm text-gray-700">المتجر: {pkg.User?.fullName ? pkg.User.fullName : 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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