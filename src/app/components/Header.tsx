'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isLoginPage = pathname === '/auth/login'
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo and How it Works */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              SMART PACKAGE
            </Link>
            <Link href="/#how-it-works" className="hover:text-green-500 transition-colors mr-10">
              كيف يعمل
            </Link>
            <Link href="/#shopping-sites" className="hover:text-green-500 transition-colors mr-10">
              مواقع التسوق
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <Link href="/packages" className="hover:text-green-500 transition-colors">
              الباقات
            </Link>
            {isLoggedIn && (
              <Link href="/blog" className="hover:text-green-500 transition-colors mr-10">
                المدونة
              </Link>
            )}
            <Link href="/contact" className="hover:text-green-500 transition-colors mr-10">
              اتصل بنا
            </Link>
            {isLoggedIn && (
              <Link href="/track" className="hover:text-green-500 transition-colors mr-10">
                تتبع الطرود
              </Link>
            )}
            {!isLoggedIn && !isLoginPage && (
              <Link
                href="/auth/login"
                className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors mr-10"
              >
                تسجيل الدخول
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4">
            <div className="flex flex-col space-y-6">
              <Link
                href="/#how-it-works"
                className="hover:text-green-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                كيف يعمل
              </Link>
              <Link
                href="/#shopping-sites"
                className="hover:text-green-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                مواقع التسوق
              </Link>
              <Link
                href="/packages"
                className="hover:text-green-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                الباقات
              </Link>
              {isLoggedIn && (
                <Link
                  href="/blog"
                  className="hover:text-green-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  المدونة
                </Link>
              )}
              <Link
                href="/contact"
                className="hover:text-green-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                اتصل بنا
              </Link>
              {isLoggedIn && (
                <Link
                  href="/track"
                  className="hover:text-green-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تتبع الطرود
                </Link>
              )}
              {!isLoggedIn && !isLoginPage && (
                <Link
                  href="/auth/login"
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
} 