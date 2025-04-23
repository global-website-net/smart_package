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
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Attempting to authorize with credentials:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        try {
          // Get user from database
          console.log('Fetching user from database...')
          const { data: user, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('email', credentials.email)
            .single()

          console.log('Database response:', { user, error: userError })

          if (userError || !user) {
            console.log('User not found or error:', userError)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          // Verify password
          console.log('Verifying password...')
          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password verification result:', isValid)

          if (!isValid) {
            console.log('Invalid password')
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          console.log('Authentication successful, returning user:', {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role
          })

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
      console.log('JWT callback:', { token, user })
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token })
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      // If the URL is relative, allow it
      if (url.startsWith("/")) return url
      // If the URL is absolute and on the same origin, allow it
      if (new URL(url).origin === baseUrl) return url
      // Otherwise, redirect to the home page
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    newUser: '/auth/register'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
} 