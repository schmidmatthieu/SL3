'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { Globe as Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { languages } from '@/app/i18n/settings';

const languageNames = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { updateProfile, user } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="bg-background/80 backdrop-blur-sm border-primary-100/30 dark:border-primary-800/30"
      >
        <Globe2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </Button>
    );
  }

  const handleLanguageChange = async (lang: string) => {
    try {
      // Changer la langue dans i18next
      await i18n.changeLanguage(lang);

      // Mettre à jour les paramètres utilisateur si l'utilisateur est connecté
      if (user) {
        await updateProfile({
          ...user,
          preferredLanguage: lang,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change language. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30 group"
        >
          <Globe2 className="h-4 w-4 text-primary-600 dark:text-primary-400 group-hover:animate-shake" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={cn(
              'cursor-pointer',
              i18n.language === lang && 'bg-primary-50 dark:bg-primary-900'
            )}
          >
            <span className="mr-2">{languageNames[lang as keyof typeof languageNames]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
