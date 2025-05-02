import { DefaultSession, AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const nextAuthSecret = process.env.NEXTAUTH_SECRET!

if (!supabaseUrl || !supabaseAnonKey || !nextAuthSecret) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Define UserRole type
type UserRole = 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'

// Extend the built-in types for Next Auth
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

  interface Session extends DefaultSession {
    user: User
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

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
          }

          // Sign in with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (authError) {
            console.error('Supabase auth error:', authError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          if (!authData.user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Get user data from Supabase
          const { data: user, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (userError || !user) {
            console.error('Error fetching user:', userError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role as UserRole,
            governorate: user.governorate,
            town: user.town,
            phonePrefix: user.phonePrefix,
            phoneNumber: user.phoneNumber
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.fullName = user.fullName
        token.email = user.email
        token.governorate = user.governorate
        token.town = user.town
        token.phonePrefix = user.phonePrefix
        token.phoneNumber = user.phoneNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.fullName = token.fullName
        session.user.email = token.email
        session.user.governorate = token.governorate
        session.user.town = token.town
        session.user.phonePrefix = token.phonePrefix
        session.user.phoneNumber = token.phoneNumber
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: nextAuthSecret,
  debug: true
} 