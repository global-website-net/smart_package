import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface EditOrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    status: string
    totalAmount?: number
  }
  onSave: (updatedOrder: {
    id: string
    status: string
    totalAmount?: number
  }) => void
}

export function EditOrderStatusModal({ isOpen, onClose, order, onSave }: EditOrderStatusModalProps) {
  const [status, setStatus] = useState(order.status)
  const [totalAmount, setTotalAmount] = useState<number | undefined>(order.totalAmount)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSave = async () => {
    try {
      // Validate payment amount when status is AWAITING_PAYMENT
      if (status === 'AWAITING_PAYMENT' && (!totalAmount || totalAmount <= 0)) {
        setError('حقل مبلغ الدفع (شيكل) مطلوب')
        return
      }

      setIsSaving(true)
      setError('')
      
      const response = await fetch('/api/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: order.id,
          status,
          totalAmount: status === 'AWAITING_PAYMENT' ? totalAmount : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      onSave({
        id: order.id,
        status,
        totalAmount: status === 'AWAITING_PAYMENT' ? totalAmount : undefined,
      })

      toast.success('تم تحديث حالة الطلب بنجاح')
      onClose()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('حدث خطأ أثناء تحديث حالة الطلب')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle className="text-xl font-bold text-center w-full">تعديل حالة الطلب</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right">
              الحالة
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3 text-right">
                <SelectValue placeholder="اختر الحالة" className="text-right" />
              </SelectTrigger>
              <SelectContent className="text-right" align="end">
                <SelectItem value="PENDING_APPROVAL" className="text-right">في انتظار الموافقة</SelectItem>
                <SelectItem value="AWAITING_PAYMENT" className="text-right">في انتظار الدفع</SelectItem>
                <SelectItem value="ORDERING" className="text-right">قيد الطلب</SelectItem>
                <SelectItem value="ORDER_COMPLETED" className="text-right">تم الطلب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'AWAITING_PAYMENT' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">
                مبلغ الدفع (شيكل)
                <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalAmount || ''}
                onChange={(e) => {
                  setError('')
                  const value = e.target.value ? parseFloat(e.target.value) : undefined
                  setTotalAmount(value)
                }}
                className={`col-span-3 px-3 py-2 border rounded-md ${error ? 'border-red-500' : ''}`}
                required
              />
              {error && (
                <p className="col-span-4 text-sm text-red-600 text-right">{error}</p>
              )}
            </div>
          )}
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