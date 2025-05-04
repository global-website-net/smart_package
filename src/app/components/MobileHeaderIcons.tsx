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
          <svg 
            className="w-8 h-8" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 9h18" />
            <path d="M15 12h2" />
          </svg>
        </Link>
      )}

      {/* New Order - Middle */}
      {isRegularUser && (
        <Link href="/new-order" className="text-white">
          <svg 
            className="w-8 h-8" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="1.5" fill="black" />
            <path d="M12 8v8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 12h8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Link>
      )}

      {/* User Account or Login Button - Left */}
      {isLoggedIn ? (
        <Link href="/account" className="text-white">
          <svg 
            className="w-8 h-8" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 10-16 0" />
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