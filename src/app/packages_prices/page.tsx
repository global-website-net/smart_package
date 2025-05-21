'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { FaBox, FaShippingFast, FaMoneyBillWave } from 'react-icons/fa'

export default function PackagesPricesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Title and underline */}
        <h1 className="text-3xl font-bold text-center mb-2">أسعارنا</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
      </main>
    </div>
  )
} 