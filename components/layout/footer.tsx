'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/layout/logo';

export function Footer() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Static content for server-side rendering
  const staticContent = {
    description: 'Professional event management platform for Switzerland',
    platform: {
      title: 'Platform',
      events: 'Events',
      pricing: 'Pricing',
    },
    company: {
      title: 'Company',
      about: 'About',
      contact: 'Contact',
      terms: 'Terms',
      privacy: 'Privacy',
    },
    copyright: 'Swiss Live Event. All rights reserved.',
  };

  // Translated content for client-side rendering
  const translatedContent = {
    description: t('footer.description'),
    platform: {
      title: t('footer.platform.title'),
      events: t('footer.platform.events'),
      pricing: t('footer.platform.pricing'),
    },
    company: {
      title: t('footer.company.title'),
      about: t('footer.company.about'),
      contact: t('footer.company.contact'),
    },
    copyright: t('footer.copyright'),
  };

  const content = isClient ? translatedContent : staticContent;

  return (
    <footer className="border-t glass-effect">
      <div className="responsive-container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="font-bold text-gradient">SL3</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">{content.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{content.platform.title}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {content.platform.events}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {content.platform.pricing}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{content.company.title}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {content.company.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {content.company.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {content.company.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {content.company.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {new Date().getFullYear()} {content.copyright}
        </div>
      </div>
    </footer>
  );
}
