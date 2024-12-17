'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { ProfileView } from '@/components/profile/profile-view'
import { useAuth } from '@/hooks/use-auth'
import { useProfile } from '@/hooks/use-profile'
import type { Profile } from '@/types/profile'

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getProfile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const profileData = await getProfile()
      setProfile(profileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [getProfile])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [user, router, fetchProfile])

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

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const handleEditComplete = () => {
    setIsEditing(false)
    fetchProfile() // Refresh profile data after edit
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Profile Settings</h1>
        {isEditing ? (
          <ProfileForm initialProfile={profile} onComplete={handleEditComplete} />
        ) : (
          <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  )
}