'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const isLoginPage = pathname === '/auth/login'
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link href="/packages" className="hover:text-green-500 transition-colors">
              الباقات
            </Link>
            <Link href="/blog" className="hover:text-green-500 transition-colors">
              المدونة
            </Link>
            <Link href="/contact" className="hover:text-green-500 transition-colors">
              اتصل بنا
            </Link>
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center hover:text-green-500 transition-colors"
                >
                  <span className="mr-2">{session?.user?.name || 'حسابي'}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      حسابي
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/tracking_packages"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        ادارة الطرود
                      </Link>
                    )}
                    {!isAdmin && (
                      <Link
                        href="/my-packages"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        طرودي
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        signOut()
                      }}
                      className="block w-full text-right px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {!isLoginPage && (
                  <Link
                    href="/auth/login"
                    className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/packages" className="hover:text-green-500 transition-colors">
                الباقات
              </Link>
              <Link href="/blog" className="hover:text-green-500 transition-colors">
                المدونة
              </Link>
              <Link href="/contact" className="hover:text-green-500 transition-colors">
                اتصل بنا
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/account" className="hover:text-green-500 transition-colors">
                    حسابي
                  </Link>
                  {isAdmin && (
                    <Link href="/tracking_packages" className="hover:text-green-500 transition-colors">
                      ادارة الطرود
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link href="/my-packages" className="hover:text-green-500 transition-colors">
                      طرودي
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-right hover:text-green-500 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                !isLoginPage && (
                  <Link
                    href="/auth/login"
                    className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors inline-block text-center"
                  >
                    تسجيل الدخول
                  </Link>
                )
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 