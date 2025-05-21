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
        <h1 className="text-3xl font-bold text-center mb-2">الأسعار</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Package */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex justify-center mb-4">
              <FaBox className="text-4xl text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">الباقة الأساسية</h2>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold">₪29</span>
              <span className="text-gray-600">/شهر</span>
            </div>
            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>شحن مجاني</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>تتبع الشحنات</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>دعم فني 24/7</span>
              </li>
            </ul>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors">
              اختر الباقة
            </button>
          </div>

          {/* Premium Package */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col border-2 border-green-500 transform scale-105">
            <div className="flex justify-center mb-4">
              <FaShippingFast className="text-4xl text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">الباقة المميزة</h2>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold">₪49</span>
              <span className="text-gray-600">/شهر</span>
            </div>
            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>كل مميزات الباقة الأساسية</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>شحن سريع</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>تأمين على الشحنات</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>خصومات حصرية</span>
              </li>
            </ul>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors">
              اختر الباقة
            </button>
          </div>

          {/* Business Package */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex justify-center mb-4">
              <FaMoneyBillWave className="text-4xl text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">باقة الأعمال</h2>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold">₪99</span>
              <span className="text-gray-600">/شهر</span>
            </div>
            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>كل مميزات الباقة المميزة</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>مدير حساب مخصص</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>تقارير تحليلية</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>حلول مخصصة للشركات</span>
              </li>
            </ul>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors">
              اختر الباقة
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 