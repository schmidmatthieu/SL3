'use client';

import { ModeToggle } from '@/components/theme/mode-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Shield, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import { useAuthStore } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname?.startsWith('/admin');
  const { user, signOut, refreshSession, isLoading } = useAuthStore();

  useEffect(() => {
    // Refresh session on component mount
    refreshSession().catch(console.error);
  }, [refreshSession]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <nav className="responsive-container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-gradient">SL3</span>
        </Link>
        
        {!isAdminPage && (
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
              Events
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {!isAdminPage && user?.role === 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/admin">
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin Panel</span>
              </Link>
            </Button>
          )}

          <LanguageSwitcher />
          <ModeToggle />

          {isLoading ? (
            <Button variant="ghost" size="icon" disabled>
              <span className="h-8 w-8 animate-pulse rounded-full bg-muted"></span>
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}