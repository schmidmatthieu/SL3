'use client'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
