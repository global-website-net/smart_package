'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  const isLoginPage = pathname === '/auth/login'

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'

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
            <Link href="/packages" className="hover:text-green-500 transition-colors">
              الباقات
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link href="/" className="text-white hover:text-green-400 transition-colors">
              الرئيسية
            </Link>
            <Link href="/how-it-works" className="text-white hover:text-green-400 transition-colors">
              كيف يعمل
            </Link>
            <Link href="/shopping-sites" className="text-white hover:text-green-400 transition-colors">
              مواقع التسوق
            </Link>
            <Link href="/packages" className="text-white hover:text-green-400 transition-colors mr-10">
              الباقات
            </Link>
            <Link href="/blog" className="text-white hover:text-green-400 transition-colors">
              المدونة
            </Link>
            <Link href="/contact" className="text-white hover:text-green-400 transition-colors">
              اتصل بنا
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/packages"
                className="hover:text-green-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                الباقات
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/account"
                    className="text-left hover:text-green-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    حسابي
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/tracking_packages"
                      className="text-left hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ادارة الطرود
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link
                      href="/my-packages"
                      className="text-left hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      طرودي
                    </Link>
                  )}
                  <Link
                    href="/blog"
                    className="text-left hover:text-green-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    المدونة
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-left hover:text-green-500 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 