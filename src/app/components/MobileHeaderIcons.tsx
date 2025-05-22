'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface MobileHeaderIconsProps {
  isRegularUser: boolean
}

export default function MobileHeaderIcons({ isRegularUser }: MobileHeaderIconsProps) {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="flex items-center">
        <Link 
          href="/auth/login" 
          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-green-700 transition-colors"
        >
          تسجيل دخول
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {/* Wallet Icon */}
      <Link href="/wallet" className="text-white hover:text-green-500 transition-colors">
        <Image 
          src="/images/white_wallet_icon_mobile.png"
          alt="Wallet"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </Link>

      {/* New Order Icon */}
      {isRegularUser && (
        <Link href="/new-order" className="text-white hover:text-green-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </Link>
      )}

      {/* My Account Icon */}
      <Link href="/my-account" className="text-white hover:text-green-500 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </Link>
    </div>
  )
} 