'use client';

import { ModeToggle } from '@/components/theme/mode-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Settings } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react';

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

  // Static content for server-side rendering
  const staticNavLinks = (
    <div className="hidden md:flex items-center space-x-6">
      <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
        Events
      </Link>
      <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
        About
      </Link>
    </div>
  );

  // Translated content for client-side rendering
  const translatedNavLinks = (
    <div className="hidden md:flex items-center space-x-6">
      <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
        {t('nav.events')}
      </Link>
      <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
        {t('nav.about')}
      </Link>
    </div>
  );

  // Static auth buttons
  const staticAuthButtons = (
    <>
      {!user ? (
        <Button variant="default" size="sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
      ) : null}
    </>
  );

  // Translated auth buttons
  const translatedAuthButtons = (
    <>
      {!user ? (
        <Button variant="default" size="sm" asChild>
          <Link href="/login">{t('nav.login')}</Link>
        </Button>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b header-shadow header-glow glass-effect">
      <nav className="responsive-container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-gradient">SL3</span>
        </Link>
        
        {!isAdminPage && (isClient ? translatedNavLinks : staticNavLinks)}

        <div className="flex items-center space-x-3">
          {!isAdminPage && user && profile?.role === 'admin' && (
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
          
          {isClient ? translatedAuthButtons : staticAuthButtons}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {profile?.imageUrl && (
                      <AvatarImage 
                        src={getFullImageUrl(profile.imageUrl)}
                        alt={profile?.firstName || user?.email || ''} 
                        onError={(e) => {
                          console.error('Error loading avatar:', e);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="text-sm font-medium">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {profile?.role === 'admin' ? t('nav.userRole.admin') : t('nav.userRole.user')}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </nav>
    </header>
  );
}