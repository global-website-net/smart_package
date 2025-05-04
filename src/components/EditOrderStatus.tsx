import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface EditOrderStatusProps {
  order: {
    id: string
    status: string
    totalAmount?: number
  }
  onClose: () => void
  onSuccess: (updatedOrder: any) => void
}

const statusOptions = [
  { value: 'PENDING_APPROVAL', label: 'في انتظار الموافقة' },
  { value: 'AWAITING_PAYMENT', label: 'في انتظار الدفع' },
  { value: 'ORDERING', label: 'قيد الطلب' },
  { value: 'ORDER_COMPLETED', label: 'تم الطلب' }
]

export default function EditOrderStatus({ order, onClose, onSuccess }: EditOrderStatusProps) {
  const [editingOrder, setEditingOrder] = useState({
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount || 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdateOrderStatus = async () => {
    // Validate payment amount when status is AWAITING_PAYMENT
    if (editingOrder.status === 'AWAITING_PAYMENT' && (!editingOrder.totalAmount || editingOrder.totalAmount <= 0)) {
      toast.error('يجب إدخال مبلغ الدفع عندما تكون الحالة في انتظار الدفع')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: editingOrder.status,
          totalAmount: editingOrder.totalAmount 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order status')
      }

      const updatedOrder = await response.json()
      toast.success('تم تحديث حالة الطلب بنجاح')
      onSuccess(updatedOrder)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الطلب')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">تعديل حالة الطلب</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">الحالة</label>
          <select
            value={editingOrder.status}
            onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {editingOrder.status === 'AWAITING_PAYMENT' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              مبلغ الدفع (شيكل)
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editingOrder.totalAmount || ''}
              onChange={(e) => setEditingOrder({ ...editingOrder, totalAmount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleUpdateOrderStatus}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
} 