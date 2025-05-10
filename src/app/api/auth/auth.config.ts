import { NextAuthOptions, User, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
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

// Define UserRole type
type UserRole = 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور')
        }

        try {
          // Clear any existing sessions first
          await supabase.auth.signOut()
          await supabaseAdmin.auth.signOut()

          // Get user from database
          const { data: user, error: userError } = await supabaseAdmin
            .from('User')
            .select('*')
            .ilike('email', credentials.email)
            .single()

          if (userError) {
            console.error('User table error:', userError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }
          if (!user) {
            console.error('User not found in User table:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Verify password using Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (authError) {
            console.error('Supabase Auth error:', authError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }
          if (!authData.user) {
            console.error('User not found in Supabase Auth:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Create a new session using the regular client
          const { data: newSession, error: sessionError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (sessionError) {
            console.error('Session creation error:', sessionError)
            throw new Error('حدث خطأ أثناء إنشاء الجلسة')
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            governorate: user.governorate,
            town: user.town,
            phonePrefix: user.phonePrefix,
            phoneNumber: user.phoneNumber
          }
        } catch (error) {
          console.error('Authentication error:', error)
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
  events: {
    async signOut() {
      // Clear Supabase session on NextAuth signout
      await supabase.auth.signOut()
      await supabaseAdmin.auth.signOut()
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
} 