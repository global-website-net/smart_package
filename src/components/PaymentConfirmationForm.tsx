'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchWalletBalance()
    }
  }, [status, session])

  const fetchWalletBalance = async () => {
    try {
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('userId', session?.user?.id)
        .single()

      if (walletError) {
        throw new Error('حدث خطأ أثناء جلب رصيد المحفظة')
      }

      setWalletBalance(wallet?.balance || 0)
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
      setError('حدث خطأ أثناء جلب رصيد المحفظة')
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setLoading(true)
      setError(null)

      if (status !== 'authenticated' || !session?.user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('userId', session.user.id)
        .single()

      if (walletError) {
        throw new Error('حدث خطأ أثناء التحقق من رصيد المحفظة')
      }

      if (!wallet || wallet.balance < totalAmount) {
        setError('رصيد المحفظة غير كافٍ. يرجى شحن المحفظة أولاً')
        return
      }

      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('order')
        .select('status, userId')
        .eq('id', orderId)
        .single()

      if (orderError) {
        throw new Error('حدث خطأ أثناء التحقق من حالة الطلب')
      }

      if (order.status !== 'AWAITING_PAYMENT') {
        throw new Error('لا يمكن دفع هذا الطلب')
      }

      // Update wallet balance
      const newBalance = wallet.balance - totalAmount
      const { error: updateWalletError } = await supabase
        .from('wallet')
        .update({ balance: newBalance })
        .eq('userId', session.user.id)

      if (updateWalletError) {
        throw new Error('حدث خطأ أثناء تحديث رصيد المحفظة')
      }

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transaction')
        .insert({
          userId: session.user.id,
          amount: -totalAmount,
          type: 'PAYMENT',
          description: `دفع مقابل الطلب رقم ${orderId}`,
          orderId: orderId
        })

      if (transactionError) {
        throw new Error('حدث خطأ أثناء تسجيل المعاملة')
      }

      // Update order status
      const { error: updateOrderError } = await supabase
        .from('order')
        .update({ status: 'ORDERING' })
        .eq('id', orderId)

      if (updateOrderError) {
        throw new Error('حدث خطأ أثناء تحديث حالة الطلب')
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center">تأكيد الدفع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold">المبلغ المطلوب: {totalAmount.toLocaleString('ar-SA')} ريال</p>
              <p className="text-sm text-gray-600 mt-2">رصيد المحفظة الحالي: {walletBalance?.toLocaleString('ar-SA') || '0'} ريال</p>
            </div>
            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}
            <div className="flex justify-center space-x-4 rtl:space-x-reverse">
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