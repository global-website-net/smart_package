import { NextAuthOptions, User, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'
import { verifyPassword, SESSION_TIMEOUT, MAX_LOGIN_ATTEMPTS, LOGIN_ATTEMPT_WINDOW } from '@/lib/security'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const nextAuthSecret = process.env.NEXTAUTH_SECRET!

if (!supabaseUrl || !supabaseAnonKey || !nextAuthSecret) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'supabase.auth.token'
  }
})

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase.auth.token'
    }
  }
)

// Store login attempts
const loginAttempts = new Map<string, { count: number; timestamp: number }>()

// Define UserRole type
type UserRole = 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'

// Extend the User type
interface ExtendedUser extends User {
  role: UserRole
  fullName: string
  governorate: string
  town: string
  phonePrefix: string
  phoneNumber: string
}

// Extend the built-in types for Next Auth
declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    fullName: string
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
    role: UserRole
    fullName: string
    governorate: string
    town: string
    phonePrefix: string
    phoneNumber: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور')
        }

        // Check for too many login attempts
        const attempts = loginAttempts.get(credentials.email)
        if (attempts) {
          if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
            const timeLeft = attempts.timestamp + LOGIN_ATTEMPT_WINDOW - Date.now()
            if (timeLeft > 0) {
              throw new Error(`تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد ${Math.ceil(timeLeft / 60000)} دقائق`)
            }
            // Reset attempts if window has passed
            loginAttempts.delete(credentials.email)
          }
        }

        try {
          // Get user from database
          const { data: user, error: userError } = await supabaseAdmin
            .from('User')
            .select('*')
            .ilike('email', credentials.email)
            .single()

          if (userError || !user) {
            // Increment failed login attempts
            const currentAttempts = loginAttempts.get(credentials.email) || { count: 0, timestamp: Date.now() }
            loginAttempts.set(credentials.email, {
              count: currentAttempts.count + 1,
              timestamp: currentAttempts.timestamp
            })
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Verify password using Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (authError || !authData.user) {
            // Increment failed login attempts
            const currentAttempts = loginAttempts.get(credentials.email) || { count: 0, timestamp: Date.now() }
            loginAttempts.set(credentials.email, {
              count: currentAttempts.count + 1,
              timestamp: currentAttempts.timestamp
            })
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Reset login attempts on successful login
          loginAttempts.delete(credentials.email)

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            fullName: user.fullName,
            governorate: user.governorate,
            town: user.town,
            phonePrefix: user.phonePrefix,
            phoneNumber: user.phoneNumber
          } as ExtendedUser
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SESSION_TIMEOUT / 1000 // Convert to seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.fullName = user.fullName
        token.governorate = user.governorate
        token.town = user.town
        token.phonePrefix = user.phonePrefix
        token.phoneNumber = user.phoneNumber
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.fullName = token.fullName
        session.user.governorate = token.governorate
        session.user.town = token.town
        session.user.phonePrefix = token.phonePrefix
        session.user.phoneNumber = token.phoneNumber
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
} 