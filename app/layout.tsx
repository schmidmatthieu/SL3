import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Header key={Math.random()} />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}