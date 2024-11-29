import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Authentication callback failed')
      }

      const data = await response.json()
      const { access_token, refresh_token } = data

      // Store tokens in cookies
      cookies().set('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      cookies().set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return NextResponse.redirect(new URL('/', request.url))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL('/auth/error', request.url)
      )
    }
  }

  return NextResponse.redirect(new URL('/auth/error', request.url))
}