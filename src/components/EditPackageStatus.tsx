import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EditPackageStatusProps {
  packageId: string
  currentStatus: string
  onClose: () => void
  onSuccess: () => void
}

const statusOptions = [
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'AWAITING_PAYMENT', label: 'في انتظار الدفع' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'SHIPPED', label: 'تم الشحن' },
  { value: 'DELIVERED', label: 'تم التسليم' },
  { value: 'ORDER_COMPLETED', label: 'تمت الطلبية' },
  { value: 'CANCELLED', label: 'ملغي' }
]

export default function EditPackageStatus({ packageId, currentStatus, onClose, onSuccess }: EditPackageStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('تم تحديث حالة الطرد بنجاح')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating package status:', error)
      toast.error('حدث خطأ أثناء تحديث حالة الطرد')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">تعديل حالة الطرد</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الحالة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center space-x-8 rtl:space-x-reverse mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 