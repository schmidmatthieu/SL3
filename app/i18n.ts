'use client';

import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { fallbackLng, languages } from './i18n/settings';

// Import all translations
const translations = languages.reduce(
  (acc, lang) => {
    acc[lang] = {
      translation: require(`./i18n/locales/${lang}/translation.json`),
    };
    return acc;
  },
  {} as Record<string, { translation: any }>
);

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng,
    supportedLngs: languages,
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    resources: translations,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18next;
