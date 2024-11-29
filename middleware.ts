import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authService } from './lib/services/auth.service'

const publicPaths = ['/login', '/register', '/unauthorized']

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const pathname = request.nextUrl.pathname

  console.log('Middleware: Checking path:', pathname)
  console.log('Middleware: Access Token:', !!accessToken)
  console.log('Middleware: Refresh Token:', !!refreshToken)

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    if (accessToken) {
      // If user is already logged in, redirect to home
      return NextResponse.redirect(new URL('/events', request.url))
    }
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!accessToken) {
    if (refreshToken) {
      // Try to refresh tokens if refresh token exists
      try {
        console.log('Attempting to refresh tokens')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        })

        console.log('Refresh token response:', response.status)

        if (response.ok) {
          const { access_token, refresh_token } = await response.json()
          
          // Create a response with new cookies
          const redirectResponse = NextResponse.redirect(new URL(request.url))
          redirectResponse.cookies.set('accessToken', access_token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            path: '/' 
          })
          redirectResponse.cookies.set('refreshToken', refresh_token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            path: '/' 
          })

          return redirectResponse
        } else if (response.status === 401) {
          // If refresh token is invalid, redirect to login
          console.log('Refresh token is invalid, redirecting to login')
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('from', pathname)
          return NextResponse.redirect(loginUrl)
        }
      } catch (error) {
        console.error('Token refresh error:', error)
      }
    }

    // No valid tokens, redirect to login
    console.log('No valid tokens, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    console.log('Verifying access token')
    const isValid = await authService.verifyToken(accessToken)
    console.log('Token validation result:', isValid)
    
    if (!isValid) {
      // If access token is invalid, try to refresh
      if (refreshToken) {
        console.log('Access token invalid, attempting refresh')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        })

        console.log('Refresh token response:', response.status)

        if (response.ok) {
          const { access_token, refresh_token } = await response.json()
          
          // Create a response with new cookies
          const redirectResponse = NextResponse.redirect(new URL(request.url))
          redirectResponse.cookies.set('accessToken', access_token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            path: '/' 
          })
          redirectResponse.cookies.set('refreshToken', refresh_token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            path: '/' 
          })

          return redirectResponse
        } else if (response.status === 401) {
          // If refresh token is invalid, redirect to login
          console.log('Refresh token is invalid, redirecting to login')
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('from', pathname)
          return NextResponse.redirect(loginUrl)
        }
      }

      // If refresh fails, redirect to login
      console.log('Token refresh failed, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (error) {
    // Token is invalid, redirect to login
    console.error('Token verification error:', error)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}