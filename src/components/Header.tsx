'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المدونة', href: '/blog' },
    { name: 'تتبع الطلبات', href: '/tracking' },
    { name: 'تتبع الطرود', href: '/tracking_packages_user' },
    { name: 'إنشاء طلب جديد', href: '/new-order' },
  ]

  return (
    <header className="bg-black text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-14 items-center relative">
          {/* Right side navigation (RTL: visually right) */}
          <div className="flex flex-1 items-center justify-start gap-6">
            <Link href="/" className="px-2 py-1 font-bold">الرئيسية</Link>
            <Link href="/how-it-works" className="px-2 py-1 font-bold">من نحن</Link>
            <Link href="/prices" className="px-2 py-1 font-bold">اسعارنا</Link>
            <Link href="/contact" className="px-2 py-1 font-bold">التواصل</Link>
          </div>

          {/* Centered Logo Image */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/images/smart_package_logo_upper_banner.png" alt="Smart Package Logo" width={180} height={40} style={{height: 40, width: 'auto'}} />
            </Link>
          </div>

          {/* Left side navigation (RTL: visually left) */}
          <div className="flex flex-1 items-center justify-end gap-6">
            <Link href="/campaigns" className="px-2 py-1 font-bold">حملات</Link>
            <Link href="/blog" className="px-2 py-1 font-bold">بلوج</Link>
            <div className="flex items-center gap-2 leading-tight">
              <Link href="/faq" className="px-2 py-1 flex flex-col items-center leading-tight font-bold">
                <span>الأسئلة</span>
                <span>المتكررة</span>
              </Link>
              {status !== 'authenticated' && pathname !== '/auth/login' && (
                <Link href="/auth/login" className="px-2 py-1 bg-green-600 rounded text-white text-sm font-bold">تسجيل دخول</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-black text-white shadow-md`}>
        <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col gap-2">
          <Link href="/" className="block px-3 py-2 font-bold">الرئيسية</Link>
          <Link href="/how-it-works" className="block px-3 py-2 font-bold">من نحن</Link>
          <Link href="/prices" className="block px-3 py-2 font-bold">اسعارنا</Link>
          <Link href="/contact" className="block px-3 py-2 font-bold">التواصل</Link>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="font-extrabold">SMART PACKAGE</span>
          </div>
          <Link href="/campaigns" className="block px-3 py-2 font-bold">حملات</Link>
          <Link href="/blog" className="block px-3 py-2 font-bold">بلوج</Link>
          <div className="flex items-center gap-2 leading-tight">
            <Link href="/faq" className="block px-3 py-2 flex flex-col items-start leading-tight font-bold">
              <span>الأسئلة</span>
              <span>المتكررة</span>
            </Link>
            {status !== 'authenticated' && pathname !== '/auth/login' && (
              <Link href="/auth/login" className="block px-3 py-2 bg-green-600 rounded text-white text-sm font-bold">تسجيل دخول</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 