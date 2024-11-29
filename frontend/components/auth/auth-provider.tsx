'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types/auth'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/utils/error'

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ 
  children,
}: { 
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      const data = await response.json()
      setUser(data.user)
      document.cookie = `token=${data.access_token}; path=/;`
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      setUser(data.user)
      document.cookie = `token=${data.access_token}; path=/;`
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const signOut = async () => {
    setUser(null)
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/login')
  }

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}