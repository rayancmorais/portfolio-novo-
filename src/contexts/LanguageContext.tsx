import { createContext, useCallback, useContext, useState } from 'react';
import i18n from '@/lib/i18n';

type Language = 'ptBR' | 'en';

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (i18n.language === 'en' ? 'en' : 'ptBR')
  );

  const toggleLanguage = useCallback(() => {
    const next: Language = language === 'ptBR' ? 'en' : 'ptBR';
    i18n.changeLanguage(next);
    setLanguage(next);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
