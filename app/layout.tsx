import '@/styles/globals.css';

import type { Metadata } from 'next';
import cn from 'classnames';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { AnimatedBackground } from '@/components/ui/animated-background';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { I18nProvider } from './i18n/I18nProvider';

export const metadata: Metadata = {
  title: 'Swiss Live Event (SL3)',
  description: 'Professional event management platform',
  keywords: ['events', 'switzerland', 'management', 'live events', 'booking'],
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={cn('min-h-screen bg-background font-sans antialiased', GeistSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <I18nProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                  {modal}
                </main>
                <Footer />
              </div>
              <Toaster />
              <AnimatedBackground />
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
