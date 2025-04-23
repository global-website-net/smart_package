'use client'

import { SessionProvider } from 'next-auth/react'
import { authOptions } from '@/lib/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={null} basePath="/api/auth">
      {children}
    </SessionProvider>
  )
} 