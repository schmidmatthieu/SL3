'use client'

import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User, Mail, Shield } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="responsive-container py-fluid-8">
        <h1 className="text-fluid-3xl font-bold tracking-tighter mb-fluid-6">
          Mon Profil
        </h1>
        <div className="grid gap-fluid-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-fluid-xl">Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-fluid-4">
              <div className="grid gap-fluid-2">
                <div className="flex items-center gap-fluid-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-fluid-base">Prénom</Label>
                </div>
                <div className="text-fluid-lg font-medium pl-6">
                  {user?.firstName || '-'}
                </div>
              </div>
              
              <div className="grid gap-fluid-2">
                <div className="flex items-center gap-fluid-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-fluid-base">Nom</Label>
                </div>
                <div className="text-fluid-lg font-medium pl-6">
                  {user?.lastName || '-'}
                </div>
              </div>

              <div className="grid gap-fluid-2">
                <div className="flex items-center gap-fluid-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-fluid-base">Email</Label>
                </div>
                <div className="text-fluid-lg font-medium pl-6">
                  {user?.email || '-'}
                </div>
              </div>

              <div className="grid gap-fluid-2">
                <div className="flex items-center gap-fluid-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-fluid-base">Rôle</Label>
                </div>
                <div className="text-fluid-lg font-medium pl-6">
                  {user?.role || 'Utilisateur'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}