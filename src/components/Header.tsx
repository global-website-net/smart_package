'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import MobileHeaderIcons from '@/app/components/MobileHeaderIcons'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isRegularUser = session?.user?.role === 'REGULAR'

  return (
    <header className="bg-black text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center relative">
          {/* Mobile menu button */}
          <div className="md:hidden flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex flex-1 items-center justify-start gap-6">
            <Link href="/" className="px-2 py-1 text-lg font-bold">الرئيسية</Link>
            <Link href="/how-it-works" className="px-2 py-1 text-lg font-bold">من نحن</Link>
            <Link href="/packages_prices" className="px-2 py-1 text-lg font-bold">اسعارنا</Link>
            <Link href="/contact" className="px-2 py-1 text-lg font-bold">التواصل</Link>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center flex-1">
            <Link href="/" className="focus:outline-none absolute left-[55%] md:left-1/2 transform -translate-x-1/2">
              <img
                src="/images/smart_package_logo_upper_banner.png"
                alt="Smart Package Logo"
                className="h-6 w-auto md:h-8"
              />
            </Link>
          </div>

          {/* Desktop right navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-6">
            <Link href="/campaigns" className="px-2 py-1 text-lg font-bold">حملات</Link>
            <Link href="/blog" className="px-2 py-1 text-lg font-bold">بلوج</Link>
            <div className="flex items-center gap-4">
              <Link href="/faq" className="px-2 py-1 text-lg font-bold">الأسئلة المتكررة</Link>
              {!session && pathname !== '/auth/login' && (
                <Link href="/auth/login" className="px-4 py-1.5 bg-green-600 rounded text-white text-base font-bold hover:bg-green-700 transition-colors">
                  تسجيل دخول
                </Link>
              )}
            </div>
          </div>

          {/* Mobile icons */}
          <div className="md:hidden flex-1 flex justify-end">
            <MobileHeaderIcons isRegularUser={isRegularUser} />
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-lg font-bold">الرئيسية</Link>
              <Link href="/how-it-works" className="block px-3 py-2 text-lg font-bold">من نحن</Link>
              <Link href="/packages_prices" className="block px-3 py-2 text-lg font-bold">اسعارنا</Link>
              <Link href="/contact" className="block px-3 py-2 text-lg font-bold">التواصل</Link>
              <Link href="/campaigns" className="block px-3 py-2 text-lg font-bold">حملات</Link>
              <Link href="/blog" className="block px-3 py-2 text-lg font-bold">بلوج</Link>
              <Link href="/faq" className="block px-3 py-2 text-lg font-bold">الأسئلة المتكررة</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 