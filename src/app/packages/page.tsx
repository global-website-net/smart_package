'use client'

import Header from '../components/Header'
import Link from 'next/link'

export default function Packages() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-32 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">أسعارنا</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
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