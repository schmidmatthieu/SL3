'use client';

import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import { getOptions, languages } from './settings';

// Fonction pour obtenir la langue initiale
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';

  try {
    // Essayer de récupérer la langue depuis le localStorage
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang && languages.includes(storedLang)) {
      return storedLang;
    }

    // Si pas de langue stockée, utiliser la langue du navigateur
    const browserLang = navigator.language.split('-')[0];
    return languages.includes(browserLang) ? browserLang : 'en';
  } catch {
    return 'en';
  }
};

// Prevent initialization on server
const i18nInstance = i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
    )
  );

if (typeof window !== 'undefined') {
  i18nInstance.init({
    ...getOptions(),
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: languages,
    load: 'languageOnly',
    debug: process.env.NODE_ENV === 'development',
  });
} else {
  i18nInstance.init({
    ...getOptions(),
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: languages,
    load: 'languageOnly',
  });
}

export default i18nInstance;
