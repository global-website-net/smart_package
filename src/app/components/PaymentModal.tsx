import { Dialog, DialogContent } from '@/components/ui/dialog'
import PaymentConfirmationForm from '@/components/PaymentConfirmationForm'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  onPaymentComplete: () => void
}

export default function PaymentModal({ isOpen, onClose, amount, orderId, onPaymentComplete }: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <PaymentConfirmationForm
          orderId={orderId}
          totalAmount={amount}
          onSuccess={onPaymentComplete}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
} 