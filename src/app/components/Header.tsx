'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import MobileHeaderIcons from './MobileHeaderIcons'
import { Package } from 'lucide-react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isLoggedIn = !!session
  const isLoginPage = pathname === '/auth/login'
  const isRegularUser = session?.user?.role === 'REGULAR'
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  const getMenuItems = () => {
    if (session?.user?.role === 'REGULAR') {
      return [
        { href: '/tracking_orders_regular', label: 'تتبع الطلبات' },
        { href: '/tracking_packages_user', label: 'تتبع الطرود' },
        { href: '/wallet', label: 'المحفظة' },
        { href: '/account', label: 'الملف الشخصي' },
        { href: '/blog', label: 'بلوج' },
      ]
    } else if (session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') {
      return [
        { href: '/accounts', label: 'جميع الحسابات' },
        { href: '/tracking', label: 'ادارة الطلبات' },
        { href: '/tracking_packages', label: 'ادارة الطرود' },
        { href: '/blog', label: 'بلوج' },
        { href: '/account', label: 'الملف الشخصي' },
      ]
    } else if (session?.user?.role === 'SHOP') {
      return [
        { href: '/shop/packages', label: 'ادارة الطرود' },
        { href: '/account', label: 'الملف الشخصي' },
      ]
    } else {
      // Default menu items for non-logged-in users
      return [
        { href: '/packages', label: 'أسعارنا' },
      ]
    }
  }

  const getTrackingLink = (role: string) => {
    if (role === 'ADMIN' || role === 'OWNER') {
      return '/tracking_packages'
    } else if (role === 'REGULAR') {
      return '/tracking_orders_regular'
    }
    return '/'
  }

  return (
    <header className="bg-black text-white fixed w-full top-0 left-0 z-50 h-20 m-0 p-0" style={{marginTop: 0, paddingTop: 0}}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button - Left Side */}
          <div className={`md:hidden order-1 relative ${isLoginPage ? 'invisible' : ''}`}>
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
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute top-full right-0 w-48 bg-black shadow-lg rounded-b-md overflow-hidden">
                {getMenuItems().map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    {item.label}
                  </Link>
                ))}
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-right px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    تسجيل الخروج
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Pricing */}
          {/* 'أسعارنا' link removed from the header */}

          {/* Center Logo */}
          <div className="flex-1 flex justify-center order-2">
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

          {/* Left Side - Login/User Menu (Desktop) */}
          {!isLoginPage && (
            <div className="hidden md:flex items-center order-3">
              {status === 'loading' ? (
                <div className="w-24 h-8 bg-black rounded-md animate-pulse"></div>
              ) : isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rtl:space-x-reverse text-white hover:text-green-500 transition-colors"
                  >
                    <span className="text-lg font-medium">{session?.user?.fullName || session?.user?.name}</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
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
                    <div className="absolute right-0 mt-2 w-48 bg-black rounded-md shadow-lg overflow-hidden">
                      {getMenuItems().map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-white hover:bg-gray-800"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          )}

          {/* Mobile Icons */}
          <div className={`md:hidden order-3 ${isLoginPage ? 'invisible' : ''}`}>
            <MobileHeaderIcons isRegularUser={isRegularUser} />
          </div>
        </div>
      </div>
    </header>
  )
} 