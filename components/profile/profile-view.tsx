'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Profile } from '@/types/profile'

interface ProfileViewProps {
  profile: Profile
  onEdit: () => void
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback>{profile.firstName?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </h3>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-1">Language</h4>
            <p className="text-sm text-muted-foreground">
              {profile.preferredLanguage === 'en' ? 'English' : 'Français'}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Theme</h4>
            <p className="text-sm text-muted-foreground capitalize">
              {profile.theme}
            </p>
          </div>
        </div>

        <Button onClick={onEdit} variant="outline" className="w-full">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  )
}
