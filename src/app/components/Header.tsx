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

          {/* Desktop Main Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-between w-full">
            {/* Right side: Navigation labels */}
            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <Link href="/faq" className="text-white text-base font-bold hover:text-green-400 flex flex-col items-center">
                  <span>الأسئلة</span>
                  <span>المتكررة</span>
                </Link>
              ) : (
                <>
                  <Link href="/about" className="text-white text-base font-bold hover:text-green-400">من نحن</Link>
                  <Link href="/packages" className="text-white text-base font-bold hover:text-green-400">اسعارنا</Link>
                </>
              )}
            </div>
            {/* Center: Logo and label */}
            <Link href="/" className={`flex items-center gap-2 mx-4 ${isLoggedIn ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
              <span className="text-sm md:text-xl font-bold">SMART PACKAGE</span>
              <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" fill="white" stroke="currentColor" strokeWidth={2} />
              </svg>
            </Link>
            {/* Left side: Log-in button */}
            {status !== 'loading' && !isLoggedIn && !isLoginPage && (
              <Link
                href="/auth/login"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Mobile Icons */}
          <div className={`md:hidden order-3 ${isLoginPage ? 'invisible' : ''}`}>
            <MobileHeaderIcons isRegularUser={isRegularUser} />
          </div>
        </div>
      </div>
    </header>
  )
} 