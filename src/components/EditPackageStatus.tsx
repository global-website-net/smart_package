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
  { value: 'PENDING_APPROVAL', label: 'في انتظار الموافقة' },
  { value: 'AWAITING_PAYMENT', label: 'في انتظار الدفع' },
  { value: 'ORDERING', label: 'قيد الطلب' },
  { value: 'ORDER_COMPLETED', label: 'تم الطلب' }
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

          <div className="flex justify-center items-center mt-6">
            <div className="flex gap-4 rtl:space-x-reverse">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
