import { randomBytes } from 'crypto'
import { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

type UserRole = 'ADMIN' | 'OWNER' | 'REGULAR' | 'SHOP'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    fullName: string
    role: UserRole
    governorate: string
    town: string
    phonePrefix: string
    phoneNumber: string
  }

  interface Session {
    user: {
      id: string
      role: UserRole
      fullName: string
      governorate: string
      town: string
      phonePrefix: string
      phoneNumber: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    fullName: string
    role: UserRole
    governorate: string
    town: string
    phonePrefix: string
    phoneNumber: string
  }
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !user) {
          return null
        }

        // Get user role from User table
        const { data: userData } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!userData) {
          return null
        }

        return {
          id: user.id,
          email: user.email || '',
          role: userData.role as UserRole,
          fullName: userData.fullName,
          governorate: userData.governorate || '',
          town: userData.town || '',
          phonePrefix: userData.phonePrefix || '',
          phoneNumber: userData.phoneNumber || ''
        }
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.fullName = token.fullName
        session.user.email = token.email
        session.user.governorate = token.governorate
        session.user.town = token.town
        session.user.phonePrefix = token.phonePrefix
        session.user.phoneNumber = token.phoneNumber
      }
      return session
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.fullName = user.fullName
        token.email = user.email
        token.governorate = user.governorate
        token.town = user.town
        token.phonePrefix = user.phonePrefix
        token.phoneNumber = user.phoneNumber
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt'
  }
} 