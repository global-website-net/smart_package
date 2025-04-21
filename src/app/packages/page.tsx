'use client'

import Header from '../components/Header'

export default function Packages() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">باقات الاشتراك</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>
          
          {/* Package sections will be added here later */}
        </div>
      </main>
    </div>
  )
} 