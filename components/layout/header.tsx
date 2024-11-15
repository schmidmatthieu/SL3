"use client";

import { ModeToggle } from '@/components/theme/mode-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { CalendarClock, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <nav className="responsive-container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <CalendarClock className="h-6 w-6 text-primary" />
          <span className="font-bold text-primary">SL3</span>
        </Link>
        
        {!isAdminPage && (
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
              Events
            </Link>
            <Link href="/venues" className="text-sm font-medium hover:text-primary transition-colors">
              Venues
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {!isAdminPage && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/admin">
                <Shield className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}