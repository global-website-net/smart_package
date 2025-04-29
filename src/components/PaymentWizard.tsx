import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PaymentWizardProps {
  onClose: () => void
  onSuccess: (amount: number) => void
}

export default function PaymentWizard({ onClose, onSuccess }: PaymentWizardProps) {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      setError('يرجى إدخال مبلغ صحيح')
      return
    }
    setStep(2)
    setError('')
  }

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
      setError('يرجى تعبئة جميع حقول البطاقة')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/wallet/add-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          cardDetails: {
            ...cardDetails,
            number: cardDetails.number.replace(/\s/g, '') // Remove spaces
          }
        })
      })

      if (!response.ok) {
        throw new Error('فشلت عملية الدفع')
      }

      const data = await response.json()
      onSuccess(parseFloat(amount))
      router.refresh()
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الدفع')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">إضافة رصيد للمحفظة</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleAmountSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ (شيكل)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                التالي
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCardSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم البطاقة
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({
                    ...cardDetails,
                    number: formatCardNumber(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0000 0000 0000 0000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم حامل البطاقة
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({
                    ...cardDetails,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم كما يظهر على البطاقة"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({
                      ...cardDetails,
                      expiry: formatExpiry(e.target.value)
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز الأمان
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({
                      ...cardDetails,
                      cvc: e.target.value.replace(/\D/g, '')
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="CVC"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                رجوع
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'جاري المعالجة...' : 'إتمام الدفع'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 