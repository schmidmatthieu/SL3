"use client";

import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { useEffect, useState } from "react";
import en from "@/lib/i18n/translations/en.json";
import fr from "@/lib/i18n/translations/fr.json";
import de from "@/lib/i18n/translations/de.json";

i18next.init({
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
  },
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || navigator.language.split("-")[0] || "en";
    i18next.changeLanguage(savedLang);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}