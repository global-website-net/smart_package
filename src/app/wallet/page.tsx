'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'

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

  useEffect(() => {
    const fetchWalletData = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/login')
        return
      }

      if (status === 'authenticated') {
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
  }, [status, router])

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
          <h1 className="text-4xl font-bold text-center mb-8">المحفظة</h1>

          {/* Wallet Balance */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 mb-6">
              <img src="/wallet-icon.svg" alt="Wallet" className="w-full h-full" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <button className="text-3xl">⟪</button>
              <button className="text-2xl">❮</button>
              <div className="text-4xl font-bold">{walletData.balance.toFixed(2)}₪</div>
              <button className="text-2xl">❯</button>
              <button className="text-3xl">⟫</button>
            </div>
            <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Call To Action
            </button>
          </div>

          {/* Transaction History */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">تاريخ المعملات</h2>
            <div className="space-y-4">
              {walletData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center border-b border-gray-200 py-4"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xl ${transaction.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {Math.abs(transaction.amount)}
                    </span>
                    <span className="text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </span>
                  </div>
                  <span className="text-gray-600">{transaction.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 