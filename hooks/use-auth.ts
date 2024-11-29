'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      }
    }
    initAuth()
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}