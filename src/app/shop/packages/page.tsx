'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/components/Header'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ShopEditWizard from '@/app/components/ShopEditWizard'
import { Filter } from 'lucide-react'

interface Package {
  id: string
  trackingNumber: string
  status: string
  shopId: string
  description: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string
    email: string
  } | null
  shop: {
    id: string
    name: string
    email: string
  } | null
}

export default function ShopPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editStatus, setEditStatus] = useState<string | undefined>(undefined)
  const [shops, setShops] = useState<{id: string, name: string, email: string, fullName: string}[]>([])
  const [isShopEditOpen, setIsShopEditOpen] = useState(false)
  const [selectedShopPackageId, setSelectedShopPackageId] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [trackingNumberFilter, setTrackingNumberFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session) {
      if (session.user.role !== 'SHOP') {
        router.push('/')
        return
      }
      console.log('SHOP session.user.id:', session.user.id)
      fetchPackages()
      fetchShops()
    }
  }, [status, session])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/shop-packages')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      const packages = await response.json()
      setPackages(packages)
    } catch (error) {
      console.error('Error in fetchPackages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/users/shops')
      if (!response.ok) throw new Error('Failed to fetch shops')
      const data = await response.json()
      setShops(data.map((shop: any) => ({
        ...shop,
        fullName: shop.fullName || shop.name || ''
      })))
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedPackage) return

    try {
      setUpdating(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('package')
        .update({ 
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedPackage.id)

      if (updateError) {
        throw new Error('حدث خطأ أثناء تحديث حالة الطرد')
      }

      setPackages(packages.map(pkg => 
        pkg.id === selectedPackage.id 
          ? { ...pkg, status: newStatus }
          : pkg
      ))

      toast.success('تم تحديث حالة الطرد بنجاح')
      setIsEditDialogOpen(false)
      setSelectedPackage(null)
    } catch (error) {
      console.error('Error in handleStatusChange:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الطرد')
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الطرد')
    } finally {
      setUpdating(false)
    }
  }

  const openEditDialog = (pkg: Package) => {
    setSelectedPackage(pkg)
    setEditStatus(pkg.status)
    setIsEditDialogOpen(true)
  }

  const handleSaveStatus = async () => {
    if (!selectedPackage || !editStatus) return
    try {
      setUpdating(true)
      setError(null)

      const response = await fetch('/api/packages/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          newStatus: editStatus
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'حدث خطأ أثناء تحديث حالة الطرد')
      }

      const updatedPackage = await response.json()
      setPackages(packages.map(pkg => 
        pkg.id === selectedPackage.id 
          ? { ...pkg, ...updatedPackage }
          : pkg
      ))

      toast.success('تم تحديث حالة الطرد بنجاح')
      setIsEditDialogOpen(false)
      setSelectedPackage(null)
    } catch (error) {
      console.error('Error in handleSaveStatus:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الطرد')
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الطرد')
    } finally {
      setUpdating(false)
    }
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

  const handleShopChange = async (newShopId: string) => {
    if (!selectedShopPackageId) return
    try {
      setUpdating(true)
      setError(null)
      const { error: updateError } = await supabase
        .from('package')
        .update({ shopId: newShopId, updatedAt: new Date().toISOString() })
        .eq('id', selectedShopPackageId)
      if (updateError) throw new Error('حدث خطأ أثناء تحديث المتجر')
      setPackages(packages.map(pkg =>
        pkg.id === selectedShopPackageId
          ? { ...pkg, shopId: newShopId, shop: shops.find(s => s.id === newShopId) || pkg.shop }
          : pkg
      ))
      toast.success('تم تحديث المتجر بنجاح')
      setIsShopEditOpen(false)
      setSelectedShopPackageId(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المتجر')
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المتجر')
    } finally {
      setUpdating(false)
    }
  }

  const filteredPackages = packages.filter(pkg => {
    const matchesTrackingNumber = trackingNumberFilter === '' || pkg.trackingNumber.includes(trackingNumberFilter)
    const matchesStatus = statusFilter === 'ALL' ? (pkg.status === 'RECEIVED' || pkg.status === 'IN_SHOP') : pkg.status === statusFilter
    return matchesTrackingNumber && matchesStatus
  })

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
            <h1 className="text-4xl font-bold mb-6">إدارة الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-48 md:w-64">
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

          {/* Mobile View */}
          {typeof window !== 'undefined' && window.innerWidth <= 640 ? (
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
                    <option value="RECEIVED">تم الاستلام</option>
                    <option value="IN_SHOP">في المتجر</option>
                  </select>
                </div>
              )}
              {filteredPackages.length === 0 ? (
                <div className="text-center py-8">لا توجد طرود</div>
              ) : (
                filteredPackages.map((pkg, idx) => (
                  <div key={pkg.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">طرد</span>
                      <span className="mx-1">|</span>
                      <span className="font-bold text-lg">#{String(idx + 1).padStart(3, '0')}</span>
                    </div>
                    <div className="mb-2 text-gray-600 text-sm">رقم التتبع: <span className="font-mono">{pkg.trackingNumber}</span></div>
                    <div className="my-4 text-5xl text-center">
                      📦
                    </div>
                    <div className="mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pkg.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{getStatusText(pkg.status)}</span>
                    </div>
                    <div className="mb-2 text-gray-500 text-sm">تاريخ الإنشاء: {new Date(pkg.createdAt).toLocaleDateString('ar')}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Desktop View */
            <>
              {/* Desktop Filters */}
              {typeof window !== 'undefined' && window.innerWidth > 640 && (
                <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-center">
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
                    <option value="RECEIVED">تم الاستلام</option>
                    <option value="IN_SHOP">في المتجر</option>
                  </select>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center font-bold text-lg">رقم التتبع</TableHead>
                    <TableHead className="text-center font-bold text-lg">الحالة</TableHead>
                    <TableHead className="text-center font-bold text-lg">الوصف</TableHead>
                    <TableHead className="text-center font-bold text-lg">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-center font-bold text-lg">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        لا توجد طرود
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                            {getStatusText(pkg.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{pkg.description || '-'}</TableCell>
                        <TableCell className="text-center">
                          {new Date(pkg.createdAt).toLocaleDateString('ar')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => openEditDialog(pkg)}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            تعديل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center w-full">تعديل بيانات الطرد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">رقم التتبع</label>
              <div className="col-span-3">
                <input
                  type="text"
                  value={selectedPackage?.trackingNumber || ''}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">الحالة</label>
              <div className="col-span-3">
                <Select
                  value={editStatus}
                  onValueChange={setEditStatus}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVED">تم الاستلام</SelectItem>
                    <SelectItem value="IN_SHOP">في المتجر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-center items-center gap-4 w-full">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-gray-500 text-white px-8 py-3 rounded-md hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={updating}
                className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                {updating ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShopEditWizard
        isOpen={isShopEditOpen}
        onClose={() => {
          setIsShopEditOpen(false)
          setSelectedShopPackageId(null)
        }}
        currentShopId={selectedShopPackageId ? packages.find(p => p.id === selectedShopPackageId)?.shopId || '' : ''}
        shops={shops}
        onSave={handleShopChange}
      />
    </div>
  )
} 