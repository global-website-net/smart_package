'use client'

import { useState } from 'react'
import Header from '../components/Header'

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'كيف يمكنني تتبع شحنتي؟',
      answer: 'يمكنك تتبع شحنتك بسهولة من خلال قسم "طرودي" في حسابك الشخصي. قم بتسجيل الدخول وانتقل إلى القسم المخصص لمتابعة حالة شحنتك وتفاصيلها.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: ''
    },
    {
      question: 'كم تكلفة خدمة التتبع؟',
      answer: 'تختلف التكلفة حسب الباقة التي تختارها. نقدم باقات أساسية ومتقدمة واحترافية. يمكنك الاطلاع على تفاصيل الأسعار في صفحة الباقات.'
    },
    {
      question: 'هل يمكنني إلغاء اشتراكي في أي وقت؟',
      answer: 'نعم، يمكنك إلغاء اشتراكك في أي وقت من خلال لوحة التحكم الخاصة بك. لن يتم خصم أي رسوم إضافية بعد الإلغاء.'
    },
    {
      question: 'هل يمكنني تغيير باقتي في أي وقت؟',
      answer: 'نعم، يمكنك ترقية باقتك في أي وقت. سيتم احتساب الفرق في السعر بشكل تناسبي. للترقية، قم بزيارة صفحة الباقات واختر الباقة الجديدة.'
    }
  ]

  const toggleFAQ = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null)
    } else {
      setActiveIndex(index)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">الأسئلة الشائعة</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button
                    className="w-full text-right flex justify-between items-center focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                    <span className="ml-4 text-blue-600">
                      {activeIndex === index ? '−' : '+'}
                    </span>
                  </button>
                  
                  {activeIndex === index && (
                    <div className="mt-2 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              لم تجد إجابة لسؤالك؟ تواصل معنا مباشرة
            </p>
            <a
              href="/contact"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              اتصل بنا
            </a>
          </div>
        </div>
      </main>
    </div>
  )
} 