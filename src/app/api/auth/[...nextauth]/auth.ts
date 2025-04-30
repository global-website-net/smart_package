import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define UserRole type
type UserRole = 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'

interface DatabaseUser {
  id: string
  email: string
  fullname: string
  role: UserRole
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        try {
          // First, authenticate with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError || !authData.user) {
            console.error('Supabase Auth error:', authError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Now get the user data from our database
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('id, email, fullName, role')
            .eq('id', authData.user.id)
            .single()

          if (userError || !userData) {
            console.error('Database error:', userError)
            throw new Error('حدث خطأ أثناء محاولة تسجيل الدخول')
          }

          return {
            id: userData.id,
            email: userData.email,
            name: userData.fullName,
            role: userData.role
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
} 