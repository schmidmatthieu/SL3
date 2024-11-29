'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { UserRole } from '@/types/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
        {children}
      </div>
    </ProtectedRoute>
  )
}