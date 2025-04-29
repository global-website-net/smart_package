import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
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
          // Try to find the user with a case-insensitive email match
          const { data: users, error: queryError } = await supabase
            .from('User')
            .select('id, email, password, fullName, role')
            .ilike('email', credentials.email)

          if (queryError) {
            console.error('Database query error:', queryError)
            throw new Error('حدث خطأ أثناء محاولة تسجيل الدخول')
          }

          // No user found
          if (!users || users.length === 0) {
            console.log('No user found with email:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Find exact email match (case-insensitive)
          const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase())
          if (!user) {
            console.log('No exact email match found')
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          console.log('Authentication successful for user:', credentials.email)

          // Return user data without sensitive information
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role
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
  debug: true
} 