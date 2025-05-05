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
  shops: Array<{ id: string; fullName: string }>
  users: Array<{ id: string; fullName: string }>
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
      
      const response = await fetch('/api/packages/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pkg.id,
          trackingNumber,
          status,
          description,
          shopId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update package')
      }

      onSave({
        id: pkg.id,
        trackingNumber,
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
              <SelectContent className="text-right" align="end">
                <SelectItem value="PENDING" className="text-right">قيد الانتظار</SelectItem>
                <SelectItem value="IN_TRANSIT" className="text-right">قيد الشحن</SelectItem>
                <SelectItem value="DELIVERED" className="text-right">تم التسليم</SelectItem>
                <SelectItem value="CANCELLED" className="text-right">ملغي</SelectItem>
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
                    {shop.fullName}
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
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 