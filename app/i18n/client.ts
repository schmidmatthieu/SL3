'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions, languages } from './settings';
import resourcesToBackend from 'i18next-resources-to-backend';

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
if (typeof window !== 'undefined') {
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`./locales/${language}/${namespace}.json`)
    ))
    .init({
      ...getOptions(),
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
      },
      lng: getInitialLanguage(),
      fallbackLng: 'en',
      supportedLngs: languages,
      load: 'languageOnly',
      debug: process.env.NODE_ENV === 'development',
    });
}

export default i18next;
