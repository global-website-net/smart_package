'use client'

import Header from '../components/Header'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'ما هي خدمة SMART PACKAGE؟',
    answer: 'SMART PACKAGE هي خدمة تتيح لك شراء المنتجات من المتاجر الإلكترونية العالمية وتوصيلها إلى عنوانك في فلسطين. نحن نتعامل مع جميع إجراءات الشحن والتخليص الجمركي نيابة عنك.'
  },
  {
    question: 'كيف يمكنني طلب خدمة SMART PACKAGE؟',
    answer: 'يمكنك طلب الخدمة من خلال إنشاء حساب على موقعنا، ثم اختيار الباقة المناسبة لك، وإضافة عنوان الشحن الخاص بك. بعد ذلك يمكنك شراء المنتجات من المتاجر الإلكترونية وإرسالها إلى عنواننا في الولايات المتحدة.'
  },
  {
    question: 'ما هي مدة التوصيل؟',
    answer: 'تختلف مدة التوصيل حسب نوع الباقة التي اخترتها. بشكل عام، تتراوح مدة التوصيل بين 7-14 يوم عمل من تاريخ استلام الشحنة في مستودعنا في الولايات المتحدة.'
  },
  {
    question: 'هل هناك قيود على نوع المنتجات التي يمكن شحنها؟',
    answer: 'نعم، هناك بعض القيود على المنتجات التي يمكن شحنها. لا يمكننا شحن المواد الخطرة أو المحظورة قانونياً. يرجى مراجعة شروط وأحكام الخدمة للحصول على قائمة كاملة بالمنتجات المحظورة.'
  },
  {
    question: 'كيف يمكنني تتبع شحنتي؟',
    answer: 'يمكنك تتبع شحنتك من خلال حسابك على موقعنا. سنزودك برقم تتبع يمكنك استخدامه لمتابعة حالة شحنتك في كل مرحلة من مراحل الشحن.'
  },
  {
    question: 'ما هي تكلفة الخدمة؟',
    answer: 'تختلف تكلفة الخدمة حسب نوع الباقة التي اخترتها وحجم ووزن الشحنة. يمكنك الاطلاع على أسعار الباقات المختلفة في قسم "الباقات" على موقعنا.'
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h1>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-green-600 mb-3">{faq.question}</h2>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 