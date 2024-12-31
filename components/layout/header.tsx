'use client';

import { ModeToggle } from '@/components/theme/mode-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Settings, User, User2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { user, profile, signOut } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userInitials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : user?.email
      ? user.email[0].toUpperCase()
      : 'U';

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const navItems = [
    { href: '/events', label: t('nav.events') },
    { href: '/about', label: t('nav.about') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-200/50 dark:border-primary-800/50 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg relative">
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      <nav className="responsive-container mx-auto flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <Logo className="h-8 w-8 group-hover:animate-logo-spin" />
          <span className="font-bold text-gradient">SL3</span>
        </Link>
        
        <div className="flex-1 flex justify-center space-x-8">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors duration-300 group",
                  isActive
                    ? "text-primary-900 dark:text-primary-200"
                    : "text-primary-700 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200"
                )}
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-600 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-glow-line" />
                {isActive && (
                  <>
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-600 to-transparent opacity-80" />
                    <span className="absolute -bottom-1 left-[5%] w-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-pulse" />
                  </>
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center justify-end space-x-2">
          {!isAdminPage && user && profile?.role === 'admin' && (
            <Link href="/admin">
              <Button
                size="icon"
                variant="outline"
                className="relative bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30 group"
              >
                <Settings className="h-4 w-4 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </Link>
          )}
          
          <LanguageSwitcher />
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30"
                >
                  {profile?.imageUrl ? (
                    <img
                      src={getFullImageUrl(profile.imageUrl)}
                      alt={profile?.firstName || user?.email || ''}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <User2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.role === 'admin' ? t('nav.userRole.admin') : t('nav.userRole.user')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30"
              >
                <User2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}