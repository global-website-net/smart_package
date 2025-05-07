import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  onPaymentComplete: () => void
}

export default function PaymentModal({ isOpen, onClose, amount, orderId, onPaymentComplete }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch('/api/wallet')
        if (!response.ok) {
          throw new Error('Failed to fetch wallet balance')
        }
        const data = await response.json()
        setWalletBalance(data.balance)
      } catch (error) {
        console.error('Error fetching wallet balance:', error)
      }
    }

    if (isOpen) {
      fetchWalletBalance()
    }
  }, [isOpen])

  const handlePayment = async () => {
    try {
      setLoading(true)
      
      // First check if user has enough balance
      const response = await fetch('/api/wallet/check-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'فشل التحقق من الرصيد')
      }

      // Process the payment
      const paymentResponse = await fetch('/api/orders/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, amount }),
      })

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json()
        throw new Error(data.error || 'فشل في معالجة الدفع')
      }

      const result = await paymentResponse.json()
      toast.success(result.message || 'تم الدفع بنجاح')
      onPaymentComplete()
      onClose()
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'حدث خطأ أثناء معالجة الدفع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">تأكيد الدفع</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="text-center mb-6">
            <p className="text-lg mb-2">المبلغ المطلوب:</p>
            <p className="text-2xl font-bold text-green-600">₪{amount.toFixed(2)}</p>
            {walletBalance !== null && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">رصيد المحفظة الحالي:</p>
                <p className="text-lg font-semibold text-gray-800">₪{walletBalance.toFixed(2)}</p>
                {walletBalance < amount && (
                  <p className="text-sm text-red-600 mt-2">
                    رصيد المحفظة غير كافٍ. يرجى شحن المحفظة أولاً
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            >
              إلغاء
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || (walletBalance !== null && walletBalance < amount)}
              className="bg-green-500 hover:bg-green-600 px-6"
            >
              {loading ? 'جاري المعالجة...' : 'دفع'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 