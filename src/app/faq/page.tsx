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
      question: 'ما هي خدمة SMART PACKAGE؟',
      answer: 'SMART PACKAGE هي خدمة تتبع الشحنات التي تتيح لك تتبع شحناتك من مختلف المتاجر الإلكترونية في مكان واحد. نحن نقدم حلولاً ذكية لتتبع وإدارة شحناتك بسهولة وكفاءة.'
    },
    {
      id: '2',
      question: 'كيف يمكنني تتبع شحنتي؟',
      answer: 'يمكنك تتبع شحنتك بسهولة من خلال إدخال رقم التتبع الخاص بالشحنة في صفحة تتبع الشحنات. سيعرض النظام لك حالة الشحنة وتفاصيلها بشكل فوري.'
    },
    {
      id: '3',
      question: 'ما هي المتاجر المدعومة؟',
      answer: 'نحن ندعم مجموعة واسعة من المتاجر الإلكترونية المحلية والعالمية. يمكنك الاطلاع على قائمة المتاجر المدعومة في صفحة "مواقع التسوق".'
    },
    {
      id: '4',
      question: 'هل الخدمة مجانية؟',
      answer: 'نعم، الخدمة الأساسية مجانية تماماً. يمكنك تتبع شحناتك وإدارتها بدون أي تكلفة. كما نقدم باقات مميزة بخدمات إضافية.'
    },
    {
      id: '5',
      question: 'كيف يمكنني التواصل مع الدعم الفني؟',
      answer: 'يمكنك التواصل مع فريق الدعم الفني من خلال صفحة "اتصل بنا". نحن متاحون لمساعدتك على مدار الساعة.'
    }
  ]

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">الأسئلة الشائعة</h1>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-right flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeIndex === index && (
                  <div className="px-6 py-4 bg-gray-50">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
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