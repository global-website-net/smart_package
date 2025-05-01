import 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    fullName: string
    role: UserRole
  }

  interface Session {
    user: User & {
      id: string
      email: string
      fullName: string
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
} 