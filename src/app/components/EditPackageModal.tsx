import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface EditPackageModalProps {
  isOpen: boolean
  onClose: () => void
  package: {
    id: string
    trackingNumber: string
    status: string
    description: string | null
    shopId: string
    userId: string
  }
  onSave: (updatedPackage: {
    id: string
    trackingNumber: string
    status: string
    description: string | null
    shopId: string
    userId: string
  }) => void
  shops: Array<{ id: string; fullName: string; email: string }>
  users: Array<{ id: string; fullName: string; email: string }>
}

export function EditPackageModal({ isOpen, onClose, package: pkg, onSave, shops, users }: EditPackageModalProps) {
  const [trackingNumber, setTrackingNumber] = useState(pkg.trackingNumber)
  const [status, setStatus] = useState(pkg.status)
  const [description, setDescription] = useState(pkg.description || '')
  const [shopId, setShopId] = useState(pkg.shopId)
  const [userId, setUserId] = useState(pkg.userId)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          description,
          shopId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update package')
      }

      const updatedPackage = await response.json()
      
      onSave({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status,
        description,
        shopId,
        userId,
      })

      toast.success('تم تحديث بيانات الطرد بنجاح')
      onClose()
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('حدث خطأ أثناء تحديث بيانات الطرد')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle className="text-xl font-bold text-center w-full">تعديل بيانات الطرد</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trackingNumber" className="text-right">
              رقم التتبع
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="col-span-3 bg-gray-100"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              الحالة
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWAITING_PAYMENT">في انتظار الدفع</SelectItem>
                <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                <SelectItem value="DELIVERING_TO_SHOP">قيد التوصيل للمتجر</SelectItem>
                <SelectItem value="IN_SHOP">في المتجر</SelectItem>
                <SelectItem value="RECEIVED">تم الاستلام</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              الوصف
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shop" className="text-right">
              المتجر
            </Label>
            <Select value={shopId} onValueChange={setShopId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر المتجر" />
              </SelectTrigger>
              <SelectContent className="text-right" align="end">
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id} className="text-right">
                    {shop.fullName} ({shop.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">
              المستخدم
            </Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر المستخدم" />
              </SelectTrigger>
              <SelectContent className="text-right" align="end">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-right">
                    {user.fullName} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-center gap-4 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 