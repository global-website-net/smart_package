import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">تأكيد الدفع</DialogTitle>
        </DialogHeader>
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