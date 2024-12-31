"use client";

import { useTranslation } from 'react-i18next';
import { languages } from "@/app/i18n/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useProfileStore } from '@/store/profile';
import { useToast } from '@/components/ui/use-toast';

const languageNames = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { updateProfile, user } = useProfileStore();
  const { toast } = useToast();
  const currentLang = i18n.language || 'en';

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
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
          >
            {languageNames[lang as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}