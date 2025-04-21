'use client'

import { useState } from 'react'
import Image from 'next/image'
import Header from '../components/Header'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Wallet() {
  const router = useRouter()
  const [balance] = useState({
    amount: '1,234.56',
    currency: 'ريال'
  })

  const [transactions] = useState([
    {
      id: 1,
      type: 'deposit',
      amount: '500.00',
      date: '2024-03-15',
      description: 'إيداع رصيد'
    },
    {
      id: 2,
      type: 'withdrawal',
      amount: '-200.00',
      date: '2024-03-14',
      description: 'سحب رصيد'
    },
    {
      id: 3,
      type: 'deposit',
      amount: '300.00',
      date: '2024-03-13',
      description: 'إيداع رصيد'
    }
  ])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        if (!session?.user) {
          router.push('/auth/login?redirect=/wallet')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login?redirect=/wallet')
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">المحفظة</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-600 mb-2">الرصيد الحالي</h2>
              <div className="text-4xl font-bold text-blue-600">
                {balance.amount} {balance.currency}
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                إيداع رصيد
              </button>
              <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors">
                سحب رصيد
              </button>
            </div>
          </div>
          
          {/* Transactions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">سجل المعاملات</h2>
            
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Image
                        src={transaction.type === 'deposit' ? '/images/wallet-icon.svg' : '/images/wallet-icon.svg'}
                        alt={transaction.type}
                        width={24}
                        height={24}
                        className={transaction.type === 'deposit' ? '' : 'invert'}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount} {balance.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 