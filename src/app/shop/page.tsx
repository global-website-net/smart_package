'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'

interface Shop {
  id: string
  name: string
  products?: Product[]
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  shopId: string
}

export default function ShopPage() {
  const { data: session } = useSession()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedShop, setSelectedShop] = useState<string | null>(null)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/shops')
        if (!response.ok) {
          throw new Error('Failed to fetch shops')
        }
        const data = await response.json()
        setShops(data)
      } catch (error) {
        console.error('Error fetching shops:', error)
        setError('حدث خطأ أثناء جلب المتاجر')
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  // Sample products data (replace with actual API call in production)
  const sampleProducts = [
    {
      id: '1',
      name: 'سماعات لاسلكية',
      price: 199.99,
      description: 'سماعات بلوتوث عالية الجودة مع إلغاء الضوضاء النشط',
      imageUrl: '/images/headphones.jpg',
      shopId: '1'
    },
    {
      id: '2',
      name: 'ساعة ذكية',
      price: 299.99,
      description: 'ساعة ذكية متعددة الوظائف مع تتبع اللياقة البدنية',
      imageUrl: '/images/smartwatch.jpg',
      shopId: '1'
    },
    // Add more sample products as needed
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6 text-text">المتاجر المتاحة</h1>
            <div className="flex justify-center items-center mb-6">
              <div className="relative w-full max-w-[600px]">
                <div className="w-full h-0.5 bg-primary"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-primary rotate-45"></div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-12">
              {error}
            </div>
          ) : (
            <div>
              {/* Shops Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShop(shop.id)}
                    className={`p-6 rounded-lg shadow-md transition-all ${
                      selectedShop === shop.id
                        ? 'bg-primary text-white'
                        : 'bg-white hover:bg-primary/5'
                    }`}
                  >
                    <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
                    <p className="text-sm opacity-80">اضغط لعرض المنتجات</p>
                  </button>
                ))}
              </div>

              {/* Products Section */}
              {selectedShop && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-text">المنتجات المتاحة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sampleProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-w-1 aspect-h-1 w-full">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                          <p className="text-sm text-text/70 mb-3">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-primary">
                              ${product.price}
                            </span>
                            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                              أضف للسلة
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 