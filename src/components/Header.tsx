'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-gray-800 text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Smart Package
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <Link href="/blog" className="text-white hover:text-green-400 transition-colors">
              المدونة
            </Link>
            <Link href="/packages" className="text-white hover:text-green-400 transition-colors">
              الباقات
            </Link>
            <Link href="/faq" className="text-white hover:text-green-400 transition-colors">
              الأسئلة الشائعة
            </Link>
            <Link href="/contact" className="text-white hover:text-green-400 transition-colors">
              اتصل بنا
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-green-400 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/tracking_packages"
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    تتبع الشحنات
                  </Link>
                )}
                <Link
                  href="/my-packages"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  شحناتي
                </Link>
                <Link
                  href="/account"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  حسابي
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-green-400 transition-colors"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  تسجيل دخول
                </Link>
                <Link
                  href="/auth/register"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/blog"
                className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
              >
                المدونة
              </Link>
              <Link
                href="/packages"
                className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
              >
                الباقات
              </Link>
              <Link
                href="/faq"
                className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
              >
                الأسئلة الشائعة
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
              >
                اتصل بنا
              </Link>
              {session ? (
                <>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/tracking_packages"
                      className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
                    >
                      تتبع الشحنات
                    </Link>
                  )}
                  <Link
                    href="/my-packages"
                    className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
                  >
                    شحناتي
                  </Link>
                  <Link
                    href="/account"
                    className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
                  >
                    حسابي
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-right px-3 py-2 text-white hover:text-green-400 transition-colors"
                  >
                    تسجيل خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
                  >
                    تسجيل دخول
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-white hover:text-green-400 transition-colors"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 