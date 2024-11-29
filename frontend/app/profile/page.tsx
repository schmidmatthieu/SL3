'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { useAuth } from '@/contexts/auth-context'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Profile Settings</h1>
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  )
}