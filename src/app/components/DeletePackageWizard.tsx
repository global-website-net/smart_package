'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface DeletePackageWizardProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  packageId: string
  trackingNumber: string
}

export default function DeletePackageWizard({ isOpen, onClose, onConfirm, packageId, trackingNumber }: DeletePackageWizardProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'حدث خطأ أثناء حذف الطرد')
      }

      onConfirm()
      onClose()
      toast.success('تم حذف الطرد بنجاح')
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الطرد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle className="text-xl font-bold text-center w-full">تأكيد الحذف</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="mb-4">هل أنت متأكد من حذف الطرد رقم {trackingNumber}؟</p>
          <p className="text-sm text-red-600 mb-6">لا يمكن التراجع عن هذا الإجراء</p>
        </div>
        <div className="flex justify-center gap-4 rtl:space-x-reverse">
          <Button
            onClick={onClose}
            variant="secondary"
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {loading ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 