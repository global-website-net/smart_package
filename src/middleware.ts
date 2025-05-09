import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize rate limiter only if Redis credentials are available
let ratelimit: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  }
} catch (error) {
  console.warn('Failed to initialize Redis rate limiter:', error)
}

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    const { pathname } = request.nextUrl

    // Public paths that don't require authentication
    const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/packages', '/blog', '/contact', '/faq']
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
    const adminOnlyPaths = ['/admin', '/accounts']
    if (adminOnlyPaths.some(path => pathname.startsWith(path)) && !['ADMIN', 'OWNER'].includes(userRole)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Shop only routes
    if (pathname.startsWith('/shop') && userRole !== 'SHOP') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Get the IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
    
    // Add security headers
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
    )

    // Apply rate limiting only if Redis is available
    if (ratelimit) {
      try {
        const { success, limit, reset, remaining } = await ratelimit.limit(ip)
        
        // If rate limit is exceeded, return 429 Too Many Requests
        if (!success) {
          return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          })
        }
      } catch (error) {
        console.warn('Rate limiting failed:', error)
        // Continue without rate limiting if it fails
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a 500 error response
    return new NextResponse('Internal Server Error', { status: 500 })
  }
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