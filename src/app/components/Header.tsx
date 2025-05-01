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
          <div className="md:hidden">
            {isLoggedIn && (
              <button
                className="p-2"
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
            )}
            {!isLoggedIn && !isLoginPage && (
              <Link
                href="/auth/login"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Logo with Location Icon - Center */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse text-base md:text-xl font-bold">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm md:text-xl">SMART PACKAGE</span>
            </Link>
          </div>

          {/* Mobile Icons - Left Side */}
          {isLoggedIn ? (
            <div className="md:hidden flex items-center space-x-4 rtl:space-x-reverse">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
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
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="md:hidden">
              <button
                className="p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Center - Pricing Button (Desktop) */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <Link 
              href="/packages" 
              className="text-white hover:text-green-500 transition-colors text-lg font-semibold mx-4 border-b-2 border-transparent hover:border-green-500"
            >
              أسعارنا
            </Link>
          </div>

          {/* Right Side - Login Button or User Name with Dropdown */}
          <div className="hidden md:block">
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
                          href="/tracking" 
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
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4 text-left">
              <Link
                href="/packages"
                className="hover:text-green-500 transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                أسعارنا
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/account"
                    className="hover:text-green-500 transition-colors px-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    الحساب الشخصي
                  </Link>
                  {isRegularUser && (
                    <Link
                      href="/wallet"
                      className="hover:text-green-500 transition-colors px-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      المحفظة
                    </Link>
                  )}
                  {isAdmin ? (
                    <Link
                      href="/tracking"
                      className="hover:text-green-500 transition-colors px-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ادارة الطلبات
                    </Link>
                  ) : !isAdmin && (
                    <Link
                      href="/tracking"
                      className="hover:text-green-500 transition-colors px-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      تتبع الطلبات
                    </Link>
                  )}
                  <Link
                    href="/blog"
                    className="hover:text-green-500 transition-colors px-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    المدونة
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="hover:text-green-500 transition-colors text-left px-4 w-full"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                !isLoginPage && (
                  <Link
                    href="/auth/login"
                    className="hover:text-green-500 transition-colors px-4"
                    onClick={() => setIsMenuOpen(false)}
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