'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">كيف يعمل</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">كيف تعمل خدمة SMART PACKAGE؟</h2>
            <p className="text-gray-700 mb-4">
              خدمة SMART PACKAGE هي منصة متكاملة لتتبع وإدارة الشحنات من مختلف المتاجر الإلكترونية. إليك كيف تعمل الخدمة:
            </p>
            
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">إنشاء حساب</h3>
                  <p className="text-gray-600">
                    قم بإنشاء حساب مجاني على منصتنا. يمكنك التسجيل باستخدام بريدك الإلكتروني أو رقم هاتفك.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">إضافة شحناتك</h3>
                  <p className="text-gray-600">
                    أضف شحناتك إلى حسابك عن طريق إدخال رقم التتبع الخاص بكل شحنة. يمكنك إضافة شحنات من مختلف المتاجر الإلكترونية.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">تتبع الشحنات</h3>
                  <p className="text-gray-600">
                    تابع حالة شحناتك في مكان واحد. ستحصل على تحديثات فورية عن حالة كل شحنة.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">إدارة الشحنات</h3>
                  <p className="text-gray-600">
                    قم بتنظيم وإدارة شحناتك بسهولة. يمكنك تصنيف الشحنات وإضافة ملاحظات وتحديد الأولويات.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">المتاجر المدعومة</h2>
            <p className="text-gray-700 mb-4">
              نقدم دعمًا لمجموعة واسعة من المتاجر الإلكترونية المحلية والعالمية، بما في ذلك:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">أمازون</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">إيباي</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">علي إكسبرس</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">نون</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">سوق</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">جولي شيك</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">شي إن</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium">والمزيد...</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link
              href="/packages_prices"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
            >
              اكتشف باقاتنا
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 