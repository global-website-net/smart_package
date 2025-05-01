'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import MobileHeaderIcons from './MobileHeaderIcons'

// Define the extended session user type
interface ExtendedSessionUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  user_metadata?: {
    full_name?: string
    governorate?: string
    town?: string
    phone_prefix?: string
    phone_number?: string
  }
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  const isLoginPage = pathname === '/auth/login'
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'
  const isRegularUser = session?.user?.role === 'REGULAR'
  
  // Get user's full name from metadata or fallback to email
  const userFullName = (session?.user as ExtendedSessionUser)?.user_metadata?.full_name || 
                      session?.user?.fullName || 
                      session?.user?.email?.split('@')[0] || 
                      'User'
  
  const welcomeText = isLoggedIn ? `اهلا بك ${userFullName}` : ''

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button - Left Side */}
          <div className="md:hidden order-1">
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          <div className="flex items-center justify-center order-2">
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
          <div className="hidden md:flex items-center order-1">
            <Link 
              href="/packages" 
              className="text-white hover:text-green-500 transition-colors text-lg font-semibold border-b-2 border-transparent hover:border-green-500"
            >
              أسعارنا
            </Link>
          </div>

          {/* Mobile Icons - Right Side */}
          {isLoggedIn ? (
            <div className="md:hidden order-3">
              <MobileHeaderIcons isRegularUser={isRegularUser} />
            </div>
          ) : !isLoginPage && (
            <div className="md:hidden order-3">
              <Link
                href="/auth/login"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}

          {/* Right Side - Login Button or User Name with Dropdown */}
          <div className="hidden md:block order-3">
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  className="flex items-center text-white hover:text-green-500 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="ml-2">{welcomeText}</span>
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
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                    <Link 
                      href="/account" 
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      الحساب الشخصي
                    </Link>

                    {isRegularUser && (
                      <Link 
                        href="/wallet" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        المحفظة
                      </Link>
                    )}
                    
                    {isAdmin ? (
                      <>
                        <Link 
                          href="/tracking_orders" 
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          ادارة الطلبات
                        </Link>
                        <Link 
                          href="/tracking_packages" 
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          ادارة الطرود
                        </Link>
                      </>
                    ) : isRegularUser && (
                      <Link 
                        href="/tracking" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        تتبع الطلبات
                      </Link>
                    )}

                    <Link 
                      href="/blog" 
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      بلوج
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleSignOut()
                      }}
                      className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : !isLoginPage && (
              <Link 
                href="/auth/login" 
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 absolute right-0 top-20 w-64 bg-black shadow-lg">
            <nav className="flex flex-col space-y-4 text-right px-4">
              <Link
                href="/packages"
                className="hover:text-green-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                أسعارنا
              </Link>
              
              {isLoggedIn && (
                <>
                  <Link
                    href="/account"
                    className="hover:text-green-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    الحساب الشخصي
                  </Link>
                  {isRegularUser && (
                    <Link
                      href="/wallet"
                      className="hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      المحفظة
                    </Link>
                  )}
                  {isAdmin ? (
                    <>
                      <Link
                        href="/tracking_orders"
                        className="hover:text-green-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ادارة الطلبات
                      </Link>
                      <Link
                        href="/tracking_packages"
                        className="hover:text-green-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ادارة الطرود
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/tracking"
                      className="hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      تتبع الطلبات
                    </Link>
                  )}
                  <Link
                    href="/blog"
                    className="hover:text-green-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    المدونة
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="hover:text-green-500 transition-colors text-right w-full"
                  >
                    تسجيل الخروج
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 