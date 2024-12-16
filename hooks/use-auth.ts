'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const { user, profile, loading, signOut: storeSignOut } = useAuthStore()
  const router = useRouter()

  const signOut = async () => {
    storeSignOut()
    router.push('/login')
  }

  return {
    user,
    profile,
    loading,
    signOut,
  }
}