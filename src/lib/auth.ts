import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        try {
          console.log('Attempting to authenticate user:', credentials.email)
          
          // Get user from database
          const { data: user, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (userError) {
            console.error('Database error during authentication:', userError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }
          
          if (!user) {
            console.error('User not found:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }
          
          console.log('User found, verifying password')
          
          // Check if password field exists and is properly formatted
          if (!user.password) {
            console.error('Password field is missing or null for user:', credentials.email)
            throw new Error('خطأ في بيانات المستخدم - يرجى إعادة تعيين كلمة المرور')
          }
          
          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password verification result:', isValid)
          
          if (!isValid) {
            console.error('Invalid password for user:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          console.log('Authentication successful for user:', credentials.email)
          
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
    })
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
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allow URLs from the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    newUser: '/auth/signup'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
} 