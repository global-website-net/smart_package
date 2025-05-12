import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PaymentConfirmationForm from '@/components/PaymentConfirmationForm'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  onPaymentComplete: () => void
}

export default function PaymentModal({ isOpen, onClose, amount, orderId, onPaymentComplete }: PaymentModalProps) {
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (isOpen && session?.user?.id) {
        try {
          const response = await fetch('/api/wallet')
          if (!response.ok) {
            throw new Error('Failed to fetch wallet data')
          }
          const data = await response.json()
          setWalletBalance(data.balance)
        } catch (error) {
          console.error('Error fetching wallet balance:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchWalletBalance()
  }, [isOpen, session?.user?.id])

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="payment-confirm-description">
        <p id="payment-confirm-description" className="sr-only">
          تأكيد دفع الطلب. هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <PaymentConfirmationForm
          orderId={orderId}
          totalAmount={amount}
          onSuccess={onPaymentComplete}
          onCancel={onClose}
          initialWalletBalance={walletBalance}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
} 