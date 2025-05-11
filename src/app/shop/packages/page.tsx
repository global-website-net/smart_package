'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Package {
  id: string
  trackingNumber: string
  status: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  weight: number
  dimensions: string
  description: string
  price: number
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'تم الاستلام' }
]

export default function ShopPackagesPage() {
  const { data: session } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      fetchPackages()
    }
  }, [session])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('package')
        .select('*')
        .eq('shopId', session?.user?.id)
        .order('createdAt', { ascending: false })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    setNewStatus(pkg.status)
    setIsEditDialogOpen(true)
  }

  const handleUpdatePackage = async () => {
    if (!selectedPackage || !newStatus) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('package')
        .update({ 
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedPackage.id)

      if (error) throw error

      toast.success('تم تحديث حالة الطرد بنجاح')
      setIsEditDialogOpen(false)
      fetchPackages()
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('حدث خطأ أثناء تحديث حالة الطرد')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">الطرود</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد طرود</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    رقم التتبع: {pkg.trackingNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">الحالة:</span> {getStatusLabel(pkg.status)}</p>
                    <p><span className="font-medium">المستلم:</span> {pkg.recipientName}</p>
                    <p><span className="font-medium">العنوان:</span> {pkg.recipientAddress}</p>
                    <p><span className="font-medium">الوزن:</span> {pkg.weight} كجم</p>
                    <p><span className="font-medium">السعر:</span> ₪{pkg.price}</p>
                    <Button
                      onClick={() => handleEditPackage(pkg)}
                      className="w-full mt-4"
                    >
                      تعديل بيانات الطرد
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بيانات الطرد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم التتبع
                </label>
                <input
                  type="text"
                  value={selectedPackage?.trackingNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
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
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updating}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdatePackage}
                  disabled={!newStatus || updating}
                >
                  {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
} 