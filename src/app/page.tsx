'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from './components/Header'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  
  const [features] = useState([
    {
      id: 1,
      title: 'تتبع الشحنات',
      description: 'تتبع شحناتك في الوقت الفعلي مع تحديثات فورية',
      icon: '📦'
    },
    {
      id: 2,
      title: 'إدارة المدفوعات',
      description: 'ادفع بسهولة وأمان مع محفظة إلكترونية متكاملة',
      icon: '💳'
    },
    {
      id: 3,
      title: 'خدمة عملاء',
      description: 'دعم متواصل على مدار الساعة لمساعدتك',
      icon: '🤝'
    }
  ])

  const [steps] = useState([
    {
      id: 1,
      title: 'إنشاء حساب',
      description: 'سجل حساب جديد في موقعنا للبدء في استخدام خدماتنا',
      icon: '👤'
    },
    {
      id: 2,
      title: 'اختيار المنتج',
      description: 'ابحث عن المنتج الذي تريده في المواقع العالمية',
      icon: '🔍'
    },
    {
      id: 3,
      title: 'حجز الطلب',
      description: 'الصق رابط المنتج في موقعنا وسنقوم بشرائه وإرساله إليك',
      icon: '📝'
    },
    {
      id: 4,
      title: 'استلام الشحنة',
      description: 'نقوم بارساله إلى عنوانك المحدد',
      icon: '🚚'
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="text-center px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">تسوق من جميع أنحاء العالم</h1>
            
            {/* Decorative Line with Diamond */}
            <div className="flex justify-center items-center mb-6">
              <div className="relative w-full max-w-[600px]">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              نسهل عليك عملية التسوق من المواقع العالمية مثل أمازون وايباي وعلي اكسبريس
            </p>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">كيف يعمل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">مميزاتنا</h2>
              <div className="flex justify-center items-center">
                <div className="relative">
                  <div className="w-48 h-0.5 bg-green-500"></div>
                  <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white rounded-lg shadow-lg p-6 text-center border border-gray-100 hover:border-green-500 transition-colors"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shopping Sites Section */}
        <section id="shopping-sites" className="py-16 bg-white w-full">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">مواقع التسوق</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Amazon */}
              <a 
                href="https://www.amazon.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow hover:border-green-500"
              >
                <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
                  <div className="text-4xl font-bold text-gray-800">A</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">أمازون</h3>
                <p className="text-gray-600">أكبر متجر إلكتروني في العالم يقدم مجموعة واسعة من المنتجات بأسعار تنافسية</p>
              </a>
              
              {/* eBay */}
              <a 
                href="https://www.ebay.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow hover:border-green-500"
              >
                <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
                  <div className="text-4xl font-bold text-gray-800">E</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">إيباي</h3>
                <p className="text-gray-600">منصة مزاد إلكتروني تتيح لك شراء وبيع المنتجات الجديدة والمستعملة</p>
              </a>
              
              {/* Ali Express */}
              <a 
                href="https://www.aliexpress.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow hover:border-green-500"
              >
                <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
                  <div className="text-4xl font-bold text-gray-800">AE</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">علي إكسبريس</h3>
                <p className="text-gray-600">منصة تسوق إلكتروني تقدم منتجات متنوعة بأسعار منخفضة من موردين عالميين</p>
              </a>
              
              {/* Sephora */}
              <a 
                href="https://www.sephora.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow hover:border-green-500"
              >
                <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
                  <div className="text-4xl font-bold text-gray-800">S</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">سيفورا</h3>
                <p className="text-gray-600">متجر متخصص في مستحضرات التجميل والعطور ومستلزمات العناية بالبشرة</p>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section - Only show when user is not logged in */}
        {!isLoggedIn && (
          <section className="bg-gray-50 py-20">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                جاهز للبدء؟
              </h2>
              <div className="flex justify-center items-center mb-8">
                <div className="relative">
                  <div className="w-48 h-0.5 bg-green-500"></div>
                  <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                انضم إلينا اليوم واستمتع بتجربة شحن ذكية ومتكاملة
              </p>
              <Link
                href="/auth/signup"
                className="bg-green-500 text-white px-12 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors inline-block"
              >
                سجل الآن
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
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
            
            <div>
              <h3 className="text-lg font-semibold mb-4">تابعنا</h3>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">فيسبوك</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">تويتر</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">انستغرام</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
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
