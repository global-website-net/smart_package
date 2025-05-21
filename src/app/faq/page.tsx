'use client'

import { useState } from 'react'
import Header from '../../components/Header'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
}

export default function FAQPage() {
  const [activeIndices, setActiveIndices] = useState<number[]>([])

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'ما هي طبيعة خدماتكم؟',
      answer: 'نحن نقدم خدمات لويتية لطلب المنتات من مواقع التوق عبر الإنترنت ونقوم بتوصيلها مباشرة إلى العميل، حتى في المناطق التي يصعب الوصول إليها عبر البريد العادي.'
    },
    {
      id: '2',
      question: 'كيف يمكنني تقديم طلب؟',
      answer: 'يمكنك تعبئة نموذ الطلب في موقعنا الإلكتروني، وإرفاق رابط المنت الذي ترغب بشرائه مع تفاصيل إضافية إن لزم.'
    },
    {
      id: '3',
      question: 'هل أحتاج إلى إنشاء حاب؟',
      answer: 'نعم، يب التيل في الموقع حتى تتمكن من متابعة طلباتك وتلقي التحديثات الخاصة بها.'
    },
    {
      id: '4',
      question: 'كيف يتم احتاب تكلفة الخدمة؟',
      answer: 'تكلفة الخدمة تُحدد بناءً على وزن المنت، حمه، وقيمة الشحن. يتم إدخال العر يدوياً من قبل فريقنا بعد اتلام الطلب.'
    },
    {
      id: '5',
      question: 'ما هي وائل الدفع المتاحة؟',
      answer: 'نقبل الدفع عبر بطاقة الائتمان وPayPal حالياً.'
    },
    {
      id: '6',
      question: 'كم من الوقت يتغرق توصيل الطلب؟',
      answer: 'يختلف وقت التوصيل حب مصدر الشراء، لكنه يتراوح عادة بين 7 إلى 21 يوماً. نقوم بتحديثك بكل مرحلة من مراحل الشحن.'
    },
    {
      id: '7',
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'بعد معالة الطلب، نرل لك رقم تتبع يمكنك اتخدامه لمتابعة حالة الشحنة في أي وقت.'
    },
    {
      id: '8',
      question: 'ماذا يحدث إذا وصل المنتج تالفاً؟',
      answer: 'يرى التواصل معنا فوراً مع صورة للمنت ونقوم بمراعة الحالة وتعويضك إذا لزم الأمر.'
    }
  ]

  const toggleFAQ = (index: number) => {
    setActiveIndices(prevIndices => {
      if (prevIndices.includes(index)) {
        return prevIndices.filter(i => i !== index)
      } else {
        return [...prevIndices, index]
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-2">الأسئلة المتكررة</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-right flex justify-between items-center hover:bg-gray-50 focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <img src="/api/images/question_icon.png" alt="Question Icon" className="w-6 h-6 ml-2" style={{display: 'inline-block', verticalAlign: 'middle'}} />
                  <span className="text-lg font-medium">{faq.question}</span>
                </span>
                {activeIndices.includes(index) ? (
                  <img
                    src="/api/images/collapse_question_icon.png"
                    alt="Collapse Question Icon"
                    className="w-5 h-5 transition-transform"
                    style={{display: 'inline-block', verticalAlign: 'middle'}}
                  />
                ) : (
                  <img
                    src="/api/images/extend_question_icon.png"
                    alt="Extend Question Icon"
                    className="w-5 h-5 transition-transform"
                    style={{display: 'inline-block', verticalAlign: 'middle'}}
                  />
                )}
              </button>
              {activeIndices.includes(index) && (
                <div className="px-6 py-4 bg-gray-50 flex items-start gap-2">
                  <img src="/api/images/answer_icon.png" alt="Answer Icon" className="w-6 h-6 ml-2 mt-1" style={{display: 'inline-block', verticalAlign: 'middle'}} />
                  <p className="text-gray-700 flex-1">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
} 