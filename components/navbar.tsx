import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full ${isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-sm' : 'bg-transparent'} transition-all duration-300`}>
      <div className="responsive-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              SL3
            </Link>
            <nav className="ml-8 hidden space-x-4 md:flex">
              <Link href="/events" className={`text-fluid-sm font-medium ${pathname === '/events' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                Événements
              </Link>
              <Link href="/about" className={`text-fluid-sm font-medium ${pathname === '/about' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                À propos
              </Link>
              <Link href="/contact" className={`text-fluid-sm font-medium ${pathname === '/contact' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost">Mon Profil</Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button variant="default">Inscription</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
