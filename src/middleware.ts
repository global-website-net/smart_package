import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add the paths that require authentication
const protectedPaths = ['/profile', '/wallet', '/blog/create', '/blog/edit', '/account']

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (isProtectedPath) {
    // Check if user is authenticated (has session token)
    const token = request.cookies.get('session')
    
    if (!token) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL('/auth/login', request.url)
      // Store the original URL to redirect back after login
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configure the paths that middleware will run on
export const config = {
  matcher: [
    '/profile/:path*',
    '/wallet/:path*',
    '/blog/create/:path*',
    '/blog/edit/:path*',
    '/account/:path*'
  ]
} 