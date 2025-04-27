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

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">الرصيد الحالي</h2>
            <p className="text-3xl font-bold text-green-600">
              {walletData.balance.toFixed(2)} شيكل
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">سجل المعاملات</h2>
            {walletData.transactions.length === 0 ? (
              <p className="text-gray-500 text-center">لا توجد معاملات</p>
            ) : (
              <div className="space-y-4">
                {walletData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{transaction.reason}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <p
                      className={`font-bold ${
                        transaction.type === 'CREDIT'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {transaction.amount.toFixed(2)} شيكل
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 