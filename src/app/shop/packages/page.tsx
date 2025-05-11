'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Header from '@/app/components/Header'

interface Package {
  id: string
  trackingNumber: string
  status: string
  description: string | null
  shopId: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
  shop: {
    fullName: string
    email: string
  }
}

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'تم الاستلام' }
]

export default function ShopPackagesPage() {
  const { data: session } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (session?.user?.role === 'SHOP') {
      fetchPackages()
    }
  }, [session])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('package')
        .select(`
          *,
          user:userId (fullName, email),
          shop:shopId (fullName, email)
        `)
        .eq('shopId', session?.user?.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        console.log('No packages found for shop:', session?.user?.id)
        setPackages([])
        return
      }

      // Transform the data to match the Package interface
      const transformedPackages = data.map((pkg: any) => {
        const shopData = Array.isArray(pkg.shop) ? pkg.shop[0] : pkg.shop
        const userData = Array.isArray(pkg.user) ? pkg.user[0] : pkg.user

        return {
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          description: pkg.description,
          shopId: pkg.shopId,
          userId: pkg.userId,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          shop: {
            id: shopData?.id || '',
            fullName: shopData?.fullName || 'غير معروف',
            email: shopData?.email || ''
          },
          user: {
            id: userData?.id || '',
            fullName: userData?.fullName || 'غير معروف',
            email: userData?.email || ''
          }
        }
      })

      console.log('Transformed packages:', transformedPackages)
      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب الطرود',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedPackage) return

    try {
      setUpdating(true)
      const { error } = await supabase
        .from('package')
        .update({ 
          status: selectedPackage.status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedPackage.id)

      if (error) throw error

      setPackages(packages.map(pkg => 
        pkg.id === selectedPackage.id ? selectedPackage : pkg
      ))

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة الطرد بنجاح'
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating package:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الطرد',
        variant: 'destructive'
      })
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
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'RETURNED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-4xl font-bold mb-6">إدارة الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-bold text-lg">رقم التتبع</TableHead>
                <TableHead className="text-center font-bold text-lg">الحالة</TableHead>
                <TableHead className="text-center font-bold text-lg">الوصف</TableHead>
                <TableHead className="text-center font-bold text-lg">المتجر</TableHead>
                <TableHead className="text-center font-bold text-lg">المستخدم</TableHead>
                <TableHead className="text-center font-bold text-lg">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center font-bold text-lg">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
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
                    <TableCell className="text-center">{pkg.shop?.fullName || 'غير محدد'}</TableCell>
                    <TableCell className="text-center">{pkg.user?.fullName || 'غير محدد'}</TableCell>
                    <TableCell className="text-center">
                      {new Date(pkg.createdAt).toLocaleDateString('ar')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>رقم التتبع</Label>
              <Input
                value={selectedPackage?.trackingNumber}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={selectedPackage?.status}
                onValueChange={(value) => setSelectedPackage(prev => prev ? { ...prev, status: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updating}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 