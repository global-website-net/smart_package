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
            <h2 className="text-4xl font-bold text-center mb-6">كيف يعمل</h2>
            
            {/* Decorative Line with Diamond */}
            <div className="flex justify-center items-center mb-12">
              <div className="relative w-full max-w-[300px]">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            
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
            <h2 className="text-3xl font-bold text-center mb-6">مواقع التسوق</h2>
            
            {/* Decorative Line with Diamond */}
            <div className="flex justify-center items-center mb-12">
              <div className="relative w-full max-w-[300px]">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            
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
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2023 SMART PACKAGE. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
