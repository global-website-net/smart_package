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

interface Package {
  id: string
  trackingNumber: string
  status: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  shopId: string
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'تم الاستلام' }
]

const STATUS_COLORS = {
  RECEIVED: 'bg-green-500',
  PENDING: 'bg-yellow-500',
  DELIVERED: 'bg-blue-500',
  CANCELLED: 'bg-red-500'
}

const STATUS_LABELS = {
  RECEIVED: 'تم الاستلام',
  PENDING: 'قيد الانتظار',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي'
}

export default function ShopPackagesPage() {
  const { data: session } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (session?.user?.id) {
      fetchPackages()
    }
  }, [session])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('Package')
        .select('*')
        .eq('shopId', session?.user?.id)
        .order('createdAt', { ascending: false })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب بيانات الطرود',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedPackage) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('Package')
        .update({ status: selectedPackage.status })
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
        description: 'حدث خطأ أثناء تحديث حالة الطرد',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">إدارة الطرود</h1>
        <p className="text-gray-600 text-center">عرض وإدارة جميع الطرود الخاصة بك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">رقم التتبع: {pkg.trackingNumber}</h3>
                  <Badge className={`${STATUS_COLORS[pkg.status as keyof typeof STATUS_COLORS] || 'bg-gray-500'} text-white`}>
                    {STATUS_LABELS[pkg.status as keyof typeof STATUS_LABELS] || pkg.status}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(pkg)}
                >
                  تعديل
                </Button>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">اسم المستلم:</span> {pkg.recipientName}</p>
                <p><span className="font-medium">رقم الهاتف:</span> {pkg.recipientPhone}</p>
                <p><span className="font-medium">العنوان:</span> {pkg.recipientAddress}</p>
                <p><span className="font-medium">تاريخ الإنشاء:</span> {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
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