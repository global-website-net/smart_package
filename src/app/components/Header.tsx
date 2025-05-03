'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import MobileHeaderIcons from './MobileHeaderIcons'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  const isLoggedIn = !!session
  const isLoginPage = pathname === '/auth/login'
  const isRegularUser = session?.user?.role === 'REGULAR'

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  const getMenuItems = () => {
    if (session?.user?.role === 'REGULAR') {
      return [
        { href: '/packages', label: 'الطرود' },
        { href: '/wallet', label: 'المحفظة' },
        { href: '/account', label: 'الملف الشخصي' },
        { href: '/blog', label: 'بلوج' },
      ]
    } else if (session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') {
      return [
        { href: '/tracking', label: 'ادارة الطلبات' },
        { href: '/tracking_packages', label: 'ادارة الطرود' },
        { href: '/blog', label: 'بلوج' },
        { href: '/account', label: 'الملف الشخصي' },
      ]
    } else if (session?.user?.role === 'SHOP') {
      return [
        { href: '/shop/orders', label: 'الطلبات' },
        { href: '/shop/packages', label: 'الطرود' },
      ]
    }
    return []
  }

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button - Left Side */}
          <div className={`md:hidden order-1 ${isLoginPage ? 'invisible' : ''}`}>
            <button
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Center Logo */}
          <div className={`flex items-center justify-center ${isLoginPage ? 'flex-1' : 'order-2'}`}>
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm md:text-xl">SMART PACKAGE</span>
              <svg 
                className="w-6 h-6 text-green-500" 
                viewBox="0 0 24 24"
              >
                <path 
                  fill="none"
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2c0 7.3-8 11.8-8 11.8z"
                />
                <circle 
                  cx="12" 
                  cy="10" 
                  r="3" 
                  fill="white" 
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </svg>
            </Link>
          </div>

          {/* Left Side - "أسعارنا" Link */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse order-1">
            {!isLoginPage && (
              <Link 
                href="/packages" 
                className="text-white hover:text-green-500 transition-colors text-lg font-semibold border-b-2 border-transparent hover:border-green-500"
              >
                أسعارنا
              </Link>
            )}
          </div>

          {/* Right Side - Login Button or User Menu */}
          <div className={`flex items-center space-x-4 rtl:space-x-reverse order-3 ${isLoginPage ? 'invisible' : ''}`}>
            {/* Desktop View */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rtl:space-x-reverse text-white hover:text-green-500 transition-colors"
                  >
                    <span>{session.user?.fullName || session.user?.email || 'المستخدم'}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {getMenuItems().map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-white hover:text-green-500 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              <MobileHeaderIcons isRegularUser={isRegularUser} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}