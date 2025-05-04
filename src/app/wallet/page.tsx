'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import PaymentWizard from '@/components/PaymentWizard'

interface WalletTransaction {
  id: string
  amount: number
  type: 'CREDIT' | 'DEBIT'
  reason: string
  createdAt: string
}

interface WalletData {
  balance: number
  transactions: WalletTransaction[]
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [walletData, setWalletData] = useState<WalletData>({ balance: 0, transactions: [] })
  const [showPaymentWizard, setShowPaymentWizard] = useState(false)

  useEffect(() => {
    const fetchWalletData = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/login')
        return
      }

      if (status === 'authenticated') {
        // Check if user is a REGULAR user
        if (session?.user?.role !== 'REGULAR') {
          router.push('/')
          return
        }

        try {
          const response = await fetch('/api/wallet')
          if (!response.ok) {
            throw new Error('Failed to fetch wallet data')
          }
          const data = await response.json()
          setWalletData(data)
        } catch (error) {
          console.error('Error fetching wallet data:', error)
          setError('حدث خطأ أثناء جلب بيانات المحفظة')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchWalletData()
  }, [status, router, session?.user?.role])

  const handlePaymentSuccess = (amount: number) => {
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance + amount
    }))
    setShowPaymentWizard(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Title and Wallet Icon */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">المحفظة</h1>
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            <div className="flex justify-center mb-8">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          {/* Balance Display */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setShowPaymentWizard(true)}
                className="text-4xl font-bold"
              >
                &#171;
              </button>
              <span className="text-4xl font-bold">{walletData.balance.toFixed(2)} ₪</span>
              <button
                onClick={() => setShowPaymentWizard(true)}
                className="text-4xl font-bold"
              >
                &#187;
              </button>
            </div>
            <button
              onClick={() => setShowPaymentWizard(true)}
              className="mt-6 bg-green-500 text-white px-8 py-2 rounded-full hover:bg-green-600 transition-colors"
            >
              Call To Action
            </button>
          </div>

          {/* Transaction History */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">تاريخ المعملات</h2>
            <div className="space-y-4">
              {walletData.transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString('ar-SA', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit'
                    })}
                  </div>
                </div>
              ))}
              {walletData.transactions.length === 0 && (
                <div className="text-center text-gray-500">
                  لا توجد معاملات حتى الآن
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showPaymentWizard && (
        <PaymentWizard
          onClose={() => setShowPaymentWizard(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}