'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PaymentConfirmationWizardProps {
  onClose: () => void
  onConfirm: () => void
  amount: number
}

export default function PaymentConfirmationWizard({
  onClose,
  onConfirm,
  amount
}: PaymentConfirmationWizardProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">تأكيد الدفع</h2>
        <div className="space-y-4">
          <p className="text-center text-gray-700">
            هل أنت متأكد من رغبتك في دفع مبلغ {amount.toFixed(2)} ₪؟
          </p>
          <div className="flex justify-center space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              إلغاء
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              تأكيد الدفع
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 