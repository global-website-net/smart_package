import NextAuth from 'next-auth'
import { authOptions } from './auth'

// Custom handler to handle remember me functionality
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 