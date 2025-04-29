'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
}

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'ما هي طبيعة خدماتكم؟',
      answer: 'نحن نقدم خدمات لوجستية لطلب المنتجات من مواقع التسوق عبر الإنترنت ونقوم بتوصيلها مباشرة إلى العميل، حتى في المناطق التي يصعب الوصول إليها عبر البريد العادي.'
    },
    {
      id: '2',
      question: 'كيف يمكنني تقديم طلب؟',
      answer: 'يمكنك تعبئة نموذج الطلب في موقعنا الإلكتروني، وإرفاق رابط المنتج الذي ترغب بشرائه مع تفاصيل إضافية إن لزم.'
    },
    {
      id: '3',
      question: 'هل أحتاج إلى إنشاء حساب؟',
      answer: 'نعم، يجب التسجيل في الموقع حتى تتمكن من متابعة طلباتك وتلقي التحديثات الخاصة بها.'
    },
    {
      id: '4',
      question: 'كيف يتم احتساب تكلفة الخدمة؟',
      answer: 'تكلفة الخدمة تُحدد بناءً على وزن المنتج، حجمه، وقيمة الشحن. يتم إدخال السعر يدوياً من قبل فريقنا بعد استلام الطلب.'
    },
    {
      id: '5',
      question: 'ما هي وسائل الدفع المتاحة؟',
      answer: 'نقبل الدفع عبر بطاقة الائتمان وPayPal حالياً.'
    },
    {
      id: '6',
      question: 'كم من الوقت يستغرق توصيل الطلب؟',
      answer: 'يختلف وقت التوصيل حسب مصدر الشراء، لكنه يتراوح عادة بين 7 إلى 21 يوماً. سنقوم بتحديثك بكل مرحلة من مراحل الشحن.'
    },
    {
      id: '7',
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'بعد معالجة الطلب، سنرسل لك رقم تتبع يمكنك استخدامه لمتابعة حالة الشحنة في أي وقت.'
    },
    {
      id: '8',
      question: 'ماذا يحدث إذا وصل المنتج تالفًا؟',
      answer: 'يرجى التواصل معنا فورًا مع صورة للمنتج وسنقوم بمراجعة الحالة وتعويضك إذا لزم الأمر.'
    }
  ]

  const toggleFAQ = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-text">الأسئلة المتكررة</h1>
          <div className="page-title-decorator">
            <span></span>
          </div>
        </div>

        {/* FAQ Icon */}
        <div className="flex justify-center mb-12">
          <div className="hexagon bg-[#7AB496] w-24 h-24 flex items-center justify-center">
            <span className="text-4xl text-white">❓</span>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="card hover:border-primary transition-colors overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-right"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center gap-4">
                  <div className={`hexagon w-8 h-8 flex items-center justify-center transition-colors ${
                    index === activeIndex ? 'bg-red-500' : 'bg-[#7AB496]'
                  }`}>
                    <span className="text-white text-xl">{index === activeIndex ? '−' : '+'}</span>
                  </div>
                  <span className="text-lg text-text">{faq.question}</span>
                </div>
                <span className="text-[#7AB496] text-2xl font-bold">س</span>
              </button>
              
              {index === activeIndex && (
                <div className="px-16 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[#7AB496] text-2xl font-bold">ج</span>
                    <p className="text-text/80">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">عن الشركة</h3>
              <p className="text-gray-400">
                نحن نقدم حلول شحن ذكية ومتكاملة لتلبية احتياجات عملائنا
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/packages" className="text-gray-400 hover:text-white transition-colors">
                    الباقات
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">الدعم</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                    الأسئلة الشائعة
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    تواصل معنا
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2023 SMART PACKAGE. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 