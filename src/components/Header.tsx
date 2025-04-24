'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-gray-800 text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Smart Package
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-24 rtl:space-x-reverse">
            <Link href="/blog" className="text-white hover:text-green-400 transition-colors">
              المدونة
            </Link>
            <Link href="/packages" className="text-white hover:text-green-400 transition-colors">
              الباقات
            </Link>
            <Link href="/faq" className="text-white hover:text-green-400 transition-colors">
              الأسئلة الشائعة
            </Link>
            <Link href="/contact" className="text-white hover:text-green-400 transition-colors">
              اتصل بنا
            </Link>
          </div>

          <div className="flex items-center space-x-8 rtl:space-x-reverse">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/tracking_packages"
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    تتبع الشحنات
                  </Link>
                )}
                <Link
                  href="/my-packages"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  شحناتي
                </Link>
                <Link
                  href="/account"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  حسابي
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-green-400 transition-colors"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  تسجيل دخول
                </Link>
                <Link
                  href="/auth/register"
                  className="text-white hover:text-green-400 transition-colors"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 