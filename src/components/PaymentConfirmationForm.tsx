'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface WalletData {
  balance: number;
}

interface PaymentConfirmationFormProps {
  orderId: string
  totalAmount: number
  onSuccess: () => void
  onCancel: () => void
}

export default function PaymentConfirmationForm({
  orderId,
  totalAmount,
  onSuccess,
  onCancel
}: PaymentConfirmationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  // Create Supabase client (no Authorization header)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (session?.user?.id) {
      fetchWalletBalance()
    }
  }, [session])

  const fetchWalletBalance = async () => {
    try {
      // First check if user is authenticated
      if (!session?.user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      // Get user's wallet using the wallet API endpoint
      const response = await fetch('/api/wallet')
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data')
      }
      const data = await response.json()
      setWalletBalance(data.balance)
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب رصيد المحفظة')
      return null
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Prevent closing when clicking the overlay
        e.stopPropagation()
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">تأكيد الدفع</CardTitle>
        </CardHeader>
        <CardContent aria-describedby="payment-description">
          <div id="payment-description" className="sr-only">
            نموذج تأكيد الدفع يوضح المبلغ المطلوب ورصيد المحفظة الحالي
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">المبلغ المطلوب: ₪{totalAmount.toFixed(2)}</p>
              <p className="text-gray-600">رصيد المحفظة الحالي: ₪{(walletBalance ?? 0).toFixed(2)}</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-4 rtl:space-x-reverse">
              <Button
                onClick={onCancel}
                disabled={loading}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? 'جاري المعالجة...' : 'تأكيد الدفع'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 