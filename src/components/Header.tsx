'use client'

import Link from 'next/link'
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
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              Smart Package
            </Link>
          </div>

          <div className="flex items-center space-x-8 rtl:space-x-reverse">
            <Link
              href="/"
              className={`${
                pathname === '/'
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium`}
            >
              الرئيسية
            </Link>
            <Link
              href="/how-it-works"
              className={`${
                pathname === '/how-it-works'
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium`}
            >
              كيف يعمل
            </Link>
            <Link
              href="/#shopping-sites"
              className={`${
                pathname === '/#shopping-sites'
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium`}
            >
              مواقع التسوق
            </Link>
            <Link
              href="/packages"
              className={`${
                pathname === '/packages'
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium`}
            >
              الباقات
            </Link>
            <Link
              href="/blog"
              className={`${
                pathname === '/blog'
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium`}
            >
              المدونة
            </Link>
            <Link
              href="/contact"
              className={`${
                pathname === '/contact'
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium`}
            >
              اتصل بنا
            </Link>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Link
                  href="/account"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
                >
                  حسابي
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
                >
                  تسجيل خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Link
                  href="/prices"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm font-medium"
                >
                  أسعارنا
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">فتح القائمة</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:hidden bg-white shadow-md`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`${
              pathname === '/'
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            } block px-3 py-2 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            الرئيسية
          </Link>
          <Link
            href="/how-it-works"
            className={`${
              pathname === '/how-it-works'
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            } block px-3 py-2 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            كيف يعمل
          </Link>
          <Link
            href="/#shopping-sites"
            className={`${
              pathname === '/#shopping-sites'
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            } block px-3 py-2 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            مواقع التسوق
          </Link>
          <Link
            href="/packages"
            className={`${
              pathname === '/packages'
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            } block px-3 py-2 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            الباقات
          </Link>
          <Link
            href="/blog"
            className={`${
              pathname === '/blog'
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            } block px-3 py-2 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            المدونة
          </Link>
          <Link
            href="/contact"
            className={`${
              pathname === '/contact'
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            } block px-3 py-2 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            اتصل بنا
          </Link>
          {status === 'authenticated' ? (
            <>
              <Link
                href="/account"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                حسابي
              </Link>
              <button
                onClick={() => {
                  signOut()
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-right px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
              >
                تسجيل خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/prices"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                أسعارنا
              </Link>
              <Link
                href="/auth/signup"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 