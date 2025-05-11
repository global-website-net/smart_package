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
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchWalletBalance()
    }
  }, [status, session])

  const fetchWalletBalance = async () => {
    try {
      // First check if user is authenticated
      if (!session?.user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      // Get user's wallet
      const { data, error } = await supabase
        .from('wallet')
        .select('balance')
        .eq('userId', session.user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No wallet exists, create one with 0 balance
          const { data: newWallet, error: createError } = await supabase
            .from('wallet')
            .insert([
              {
                userId: session.user.id,
                balance: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('Error creating wallet:', createError)
            throw new Error('حدث خطأ أثناء إنشاء المحفظة')
          }

          setWalletBalance(0)
          return
        }
        console.error('Error fetching wallet:', error)
        throw new Error('حدث خطأ أثناء جلب رصيد المحفظة')
      }
      setWalletBalance((data as WalletData)?.balance ?? 0)
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

      if (status !== 'authenticated' || !session?.user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      // Fetch wallet balance first
      const { data, error: balanceError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('userId', session.user.id)
        .single()

      if (balanceError) {
        throw new Error('حدث خطأ أثناء جلب رصيد المحفظة')
      }

      const currentBalance = (data as WalletData)?.balance ?? 0

      if (currentBalance < totalAmount) {
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
      const newBalance = currentBalance - totalAmount
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