'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

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
  const userName = session?.user?.name || 'المستخدم'

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              SMART PACKAGE
            </Link>
          </div>

          {/* Center - Mobile Menu Button */}
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

          {/* Right Side - Login Button or User Name with Dropdown */}
          <div>
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  className="flex items-center text-white hover:text-green-500 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="ml-2">{userName}</span>
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
                        href="/tracking_packages" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        ادارة الطرود
                      </Link>
                    ) : (
                      <Link 
                        href="/my-packages" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        طرودي
                      </Link>
                    )}
                    
                    <Link 
                      href="/blog" 
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      المدونة
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
                  {isAdmin && (
                    <Link
                      href="/tracking_packages"
                      className="text-left hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ادارة الطرود
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link
                      href="/my-packages"
                      className="text-left hover:text-green-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      طرودي
                    </Link>
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