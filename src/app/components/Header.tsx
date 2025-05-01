'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

// Define the extended session user type
interface ExtendedSessionUser {
  id: string
  email: string
  name: string
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
                      session?.user?.name || 
                      session?.user?.email?.split('@')[0] || 
                      'User'
  
  const welcomeText = isLoggedIn ? `اهلا بك ${userFullName}` : ''

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button - Right Side */}
          <div className="md:hidden order-1">
            {isLoggedIn ? (
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
            ) : !isLoginPage && (
              <Link
                href="/auth/login"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Center Logo */}
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse text-base md:text-xl font-bold order-2">
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

          {/* Mobile Icons - Left Side */}
          {isLoggedIn && (
            <div className="md:hidden flex items-center space-x-4 rtl:space-x-reverse order-3">
              <Link 
                href="/wallet"
                className="text-white hover:text-green-500 transition-colors"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </Link>

              <Link 
                href="/account"
                className="text-white hover:text-green-500 transition-colors"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
                  />
                </svg>
              </Link>

              <Link 
                href="/new-order"
                className="text-white hover:text-green-500 transition-colors bg-green-500 rounded-full p-2 flex items-center justify-center"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z"
                  />
                </svg>
              </Link>
            </div>
          )}

          {/* Logo with Location Icon - Center */}
          <div className="hidden md:flex items-center order-3">
            <Link 
              href="/packages" 
              className="text-white hover:text-green-500 transition-colors text-lg font-semibold border-b-2 border-transparent hover:border-green-500"
            >
              أسعارنا
            </Link>
          </div>

          {/* Right Side - Login Button or User Name with Dropdown */}
          <div className="hidden md:block order-1">
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
            ) : (
              !isLoginPage && (
                <Link 
                  href="/auth/login" 
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              )
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