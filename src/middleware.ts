import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/packages', '/blog', '/contact', '/faq']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  const userRole = token.role as string

  // Admin/Owner only routes
  if (pathname.startsWith('/admin') && !['ADMIN', 'OWNER'].includes(userRole)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Shop only routes
  if (pathname.startsWith('/shop') && userRole !== 'SHOP') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 