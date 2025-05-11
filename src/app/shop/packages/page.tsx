'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
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
      fetchPackages()
    }
  }, [status, session])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      if (!session?.user?.id) {
        throw new Error('User not authenticated')
      }

      console.log('Fetching packages for shop ID:', session.user.id)

      const { data: packages, error } = await supabase
        .from('package')
        .select(`
          id,
          trackingNumber,
          status,
          description,
          shopId,
          userId,
          createdAt,
          updatedAt,
          user:User!userId (
            id,
            fullName,
            email
          ),
          shop:shopId (
            id,
            fullName,
            email
          )
        `)
        .eq('shopId', session.user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching packages:', error)
        throw new Error('Failed to fetch packages')
      }

      console.log('Fetched packages for shop:', packages)

      if (!packages || packages.length === 0) {
        console.log('No packages found for shop:', session?.user?.id)
        setPackages([])
        return
      }

      // Transform the data to match our Package interface
      const transformedData = packages.map((pkg: any) => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        description: pkg.description,
        shopId: pkg.shopId,
        userId: pkg.userId,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        user: pkg.user?.[0] || null,
        shop: pkg.shop?.[0] || null
      }))

      setPackages(transformedData)
    } catch (error) {
      console.error('Error in fetchPackages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
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
            <h1 className="text-4xl font-bold mb-6">الطرود</h1>
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
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    لا توجد طرود
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
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
                        onClick={() => {
                          setSelectedPackage(pkg)
                          setIsEditDialogOpen(true)
                        }}
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
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الطرد</DialogTitle>
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
                  value={selectedPackage?.status}
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVED">تم الاستلام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 