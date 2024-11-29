import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const navigation = {
  main: [
    { name: 'À propos', href: '/about' },
    { name: 'Événements', href: '/events' },
    { name: 'Contact', href: '/contact' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'Démo', href: '/demo' },
  ],
  legal: [
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'Conditions', href: '/terms' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: Linkedin,
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t">
      <div className="responsive-container py-fluid-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-8">
          {/* Branding and Description */}
          <div className="space-y-fluid-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              SL3
            </Link>
            <p className="text-fluid-sm text-muted-foreground">
              La plateforme de gestion d'événements la plus complète de Suisse. Transformez vos événements en expériences numériques exceptionnelles.
            </p>
          </div>

          {/* Main Navigation */}
          <div>
            <h3 className="text-fluid-lg font-semibold mb-fluid-4">Navigation</h3>
            <ul className="space-y-fluid-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-fluid-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-fluid-lg font-semibold mb-fluid-4">Légal</h3>
            <ul className="space-y-fluid-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-fluid-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-fluid-lg font-semibold mb-fluid-4">Suivez-nous</h3>
            <div className="flex space-x-fluid-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-fluid-8 pt-fluid-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-fluid-4">
            <p className="text-fluid-sm text-muted-foreground">
              © {new Date().getFullYear()} SL3. Tous droits réservés.
            </p>
            <p className="text-fluid-sm text-muted-foreground">
              Fait avec ❤️ en Suisse
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
