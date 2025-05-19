'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import PaymentWizard from '@/components/PaymentWizard'
import BalanceDisplay from '@/components/BalanceDisplay'

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Title and Wallet Icon */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">المحفظة</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Wallet Icon */}
          <div className="flex justify-center mb-12">
            <img src="/images/wallet_icon_mobile.png" alt="Wallet Icon" className="w-24 h-24" style={{display: 'inline-block', verticalAlign: 'middle'}} />
          </div>

          {/* Balance Display */}
          <div className="flex justify-center items-center mb-8">
            <div className="mx-4">
              <BalanceDisplay amount={walletData.balance} />
            </div>
          </div>

          {/* Add Balance Button and Green Line */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowPaymentWizard(true)}
              className="bg-green-500 text-white px-8 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-4"
            >
              إضافة رصيد
            </button>
          </div>

          {/* Transaction History */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">تاريخ المعملات</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4 font-bold text-gray-700">
                <span className="w-1/3 text-center">التاريخ</span>
                <span className="w-1/3 text-center">السبب</span>
                <span className="w-1/3 text-center">المبلغ</span>
              </div>
              {walletData.transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-1 w-1/3 justify-center">
                    <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <img src="/images/calendar_icon.png" alt="Calendar Icon" className="w-5 h-5" />
                  </div>
                  <span className="w-1/3 text-center text-sm text-gray-700">{transaction.reason}</span>
                  <div className="flex items-center gap-4 w-1/3 justify-center">
                    <span
                      className={`text-xl font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}
                      dir="rtl"
                    >
                      {transaction.amount.toFixed(2)}₪{transaction.type === 'DEBIT' ? '-' : '+'}
                    </span>
                  </div>
                </div>
              ))}
              {walletData.transactions.length === 0 && (
                <div className="text-center text-gray-500 font-bold">
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