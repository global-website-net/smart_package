'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Shop {
  id: string
  fullName: string
  email: string
}

interface ShopEditWizardProps {
  isOpen: boolean
  onClose: () => void
  currentShopId: string
  shops: Shop[]
  onSave: (shopId: string) => void
}

export default function ShopEditWizard({
  isOpen,
  onClose,
  currentShopId,
  shops,
  onSave
}: ShopEditWizardProps) {
  const [selectedShopId, setSelectedShopId] = useState(currentShopId)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      onSave(selectedShopId)
      toast.success('تم تحديث المتجر بنجاح')
      onClose()
    } catch (error) {
      console.error('Error updating shop:', error)
      toast.error('حدث خطأ أثناء تحديث المتجر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">تعديل المتجر</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اختر المتجر</label>
              <Select
                value={selectedShopId}
                onValueChange={setSelectedShopId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر المتجر" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 