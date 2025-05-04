import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface MobileHeaderIconsProps {
  isRegularUser: boolean
}

export default function MobileHeaderIcons({ isRegularUser }: MobileHeaderIconsProps) {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  return (
    <div className="md:hidden flex items-center gap-4">
      {/* Wallet - Right */}
      {isRegularUser && (
        <Link href="/wallet" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </Link>
      )}

      {/* New Order - Middle */}
      {isRegularUser && (
        <Link href="/new-order" className="relative">
          <div className="w-7 h-7 rounded-full border-2 border-green-500"></div>
          <svg 
            className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
            fill="none" 
            stroke="#22C55E" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}

      {/* User Account or Login Button - Left */}
      {isLoggedIn ? (
        <Link href="/account" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      ) : (
        <Link 
          href="/auth/login" 
          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          تسجيل الدخول
        </Link>
      )}
    </div>
  )
} 