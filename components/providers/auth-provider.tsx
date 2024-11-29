'use client'

import { createContext, useContext, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
})

const publicPaths = ['/login', '/register']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, getCurrentUser, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const isPublicPath = publicPaths.includes(pathname)
      
      if (!user && !isPublicPath) {
        router.push('/login')
      } else if (user && isPublicPath) {
        router.push('/events')
      }
    }
  }, [user, isLoading, pathname])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
