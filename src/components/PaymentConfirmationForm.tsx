'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface PaymentConfirmationFormProps {
  orderId: string
  totalAmount: number
  onSuccess: () => void
  onCancel: () => void
  initialWalletBalance: number | null
  loading: boolean
}

export default function PaymentConfirmationForm({
  orderId,
  totalAmount,
  onSuccess,
  onCancel,
  initialWalletBalance,
  loading
}: PaymentConfirmationFormProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true)
      setError(null)

      if (!session?.user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      // Check if wallet has sufficient balance
      const response = await fetch('/api/wallet/check-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: totalAmount })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'حدث خطأ أثناء التحقق من الرصيد')
      }

      // Process the payment
      const paymentResponse = await fetch('/api/orders/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: totalAmount
        })
      })

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json()
        throw new Error(data.error || 'حدث خطأ أثناء عملية الدفع')
      }

      toast.success('تم الدفع بنجاح')
      onSuccess()
      router.refresh()
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء عملية الدفع')
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء عملية الدفع')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold mb-2">المبلغ المطلوب: ₪{totalAmount.toFixed(2)}</p>
        {loading ? (
          <div className="animate-pulse">
            <p className="text-gray-600">جاري تحميل رصيد المحفظة...</p>
          </div>
        ) : (
          <p className="text-gray-600">رصيد المحفظة الحالي: ₪{(initialWalletBalance ?? 0).toFixed(2)}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={processing}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleConfirmPayment}
          disabled={processing || loading}
          className="bg-green-500 hover:bg-green-600"
        >
          {processing ? 'جاري المعالجة...' : 'تأكيد الدفع'}
        </Button>
      </div>
    </div>
  )
} 