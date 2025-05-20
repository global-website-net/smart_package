'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Header from '../../components/Header'

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
          {/* Left side navigation (RTL: visually right) */}
          <div className="flex flex-1 items-center justify-start gap-6">
            <Link href="/" className="px-2 py-1 font-bold">الرئيسية</Link>
            <Link href="/how-it-works" className="px-2 py-1">من نحن</Link>
            <Link href="/prices" className="px-2 py-1">اسعارنا</Link>
            <Link href="/contact" className="px-2 py-1">التواصل</Link>
          </div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-white text-lg font-extrabold">
              <img src="/images/logo_pin.png" alt="logo" className="w-6 h-6" />
              <span>SMART PACKAGE</span>
            </Link>
          </div>

          {/* Right side navigation (RTL: visually left) */}
          <div className="flex flex-1 items-center justify-end gap-6">
            <Link href="/campaigns" className="px-2 py-1">حملات</Link>
            <Link href="/blog" className="px-2 py-1">بلوج</Link>
            <Link href="/faq" className="px-2 py-1 flex flex-col items-center leading-tight">
              <span>الأسئلة</span>
              <span>المتكررة</span>
            </Link>
          </div>

          {/* Auth/account buttons (far right, overlay) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {status === 'authenticated' ? (
              <>
                <Link href="/account" className="px-2 py-1">حسابي</Link>
                <button onClick={() => signOut()} className="px-2 py-1">تسجيل خروج</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-2 py-1">تسجيل دخول</Link>
                <Link href="/auth/signup" className="px-2 py-1 bg-green-600 rounded text-white">إنشاء حساب</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-black text-white shadow-md`}>
        <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col gap-2">
          <Link href="/" className="block px-3 py-2">الرئيسية</Link>
          <Link href="/how-it-works" className="block px-3 py-2">من نحن</Link>
          <Link href="/prices" className="block px-3 py-2">اسعارنا</Link>
          <Link href="/contact" className="block px-3 py-2">التواصل</Link>
          <Link href="/campaigns" className="block px-3 py-2">حملات</Link>
          <Link href="/blog" className="block px-3 py-2">بلوج</Link>
          <Link href="/faq" className="block px-3 py-2 flex flex-col items-start leading-tight">
            <span>الأسئلة</span>
            <span>المتكررة</span>
          </Link>
          {status === 'authenticated' ? (
            <>
              <Link href="/account" className="block px-3 py-2">حسابي</Link>
              <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="block px-3 py-2">تسجيل خروج</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block px-3 py-2">تسجيل دخول</Link>
              <Link href="/auth/signup" className="block px-3 py-2 bg-green-600 rounded text-white">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 