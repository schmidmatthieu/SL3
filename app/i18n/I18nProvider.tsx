'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from './client';
import { useProfileStore } from '@/store/profile';

export function I18nProvider({ children }: PropsWithChildren) {
  const [isClient, setIsClient] = useState(false);
  const { user } = useProfileStore();

  useEffect(() => {
    setIsClient(true);
    
    // Si l'utilisateur est connecté et a une langue préférée, l'utiliser
    if (user?.preferredLanguage) {
      i18next.changeLanguage(user.preferredLanguage);
    }
  }, [user]);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}
