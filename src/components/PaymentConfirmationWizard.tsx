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
          <div className="flex justify-center gap-4 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              تأكيد الدفع
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 