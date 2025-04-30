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
          </div>

          {/* Logo - Center */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link href="/" className="text-xl font-bold">
              SMART PACKAGE
            </Link>
          </div>

          {/* Mobile Icons - Left Side */}
          {isLoggedIn && (
            <div className="md:hidden flex items-center space-x-4 rtl:space-x-reverse">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </Link>

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
                      حسابي
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
                      <Link 
                        href="/tracking" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        ادارة الطلبات
                      </Link>
                    ) : isRegularUser && (
                      <>
                        <Link 
                          href="/tracking" 
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          تتبع الطلبات
                        </Link>
                        <Link 
                          href="/tracking_packages" 
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          ادارة الطرود
                        </Link>
                      </>
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
                  {isRegularUser && (
                    <Link
                      href="/wallet"
                      className="text-left hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      المحفظة
                    </Link>
                  )}
                  {isAdmin ? (
                    <Link
                      href="/tracking"
                      className="text-left hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ادارة الطلبات
                    </Link>
                  ) : !isAdmin && (
                    <>
                      <Link
                        href="/tracking"
                        className="text-left hover:text-green-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        تتبع الطلبات
                      </Link>
                      <Link
                        href="/tracking_packages"
                        className="text-left hover:text-green-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ادارة الطرود
                      </Link>
                    </>
                  )}
                  <Link
                    href="/blog"
                    className="text-left hover:text-green-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    المدونة
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="text-left hover:text-green-500 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                !isLoginPage && (
                  <Link
                    href="/auth/login"
                    className="text-left hover:text-green-500 transition-colors"
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