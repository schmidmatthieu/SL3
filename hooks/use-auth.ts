'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/components/auth/auth-provider'

export function useAuth() {
  const context = useContext(AuthContext)
  const router = useRouter()

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const signOut = async () => {
    await context.signOut()
    router.refresh()
    router.push('/login')
  }

  return {
    user: context.user,
    profile: context.profile,
    loading: context.loading,
    signOut,
  }
}