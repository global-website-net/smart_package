import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PaymentConfirmationForm from '@/components/PaymentConfirmationForm'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  onPaymentComplete: () => void
}

export default function PaymentModal({ isOpen, onClose, amount, orderId, onPaymentComplete }: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="payment-confirm-description">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-center">تأكيد الدفع</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <p id="payment-confirm-description" className="sr-only">
          تأكيد دفع الطلب. هذا الإجراء لا يمكن التراجع عنه.
        </p>
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