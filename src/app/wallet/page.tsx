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
            <svg 
              className="w-24 h-24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="black" 
              strokeWidth="1.5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 9h18" />
              <path d="M15 12h2" />
            </svg>
          </div>

          {/* Balance Display with Arrows */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Right Side Arrows */}
            <div className="flex items-center gap-2">
              <button className="text-4xl text-black cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="text-4xl text-black cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-12 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Balance Amount */}
            <div className="text-4xl font-bold mx-4 font-mono">
              {walletData.balance.toFixed(2)}₪
            </div>

            {/* Left Side Arrows */}
            <div className="flex items-center gap-2">
              <button className="text-4xl text-black cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="text-4xl text-black cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-12 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Add Balance Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowPaymentWizard(true)}
              className="bg-green-500 text-white px-8 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-12"
            >
              Call To Action
            </button>
          </div>

          {/* Green Line Separator */}
          <div className="w-full max-w-md h-0.5 bg-green-500"></div>

          {/* Transaction History */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">تاريخ المعملات</h2>
            <div className="space-y-4">
              {walletData.transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString('ar-SA', {
                        month: '2-digit',
                        day: '2-digit',
                        year: '2-digit'
                      })}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
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