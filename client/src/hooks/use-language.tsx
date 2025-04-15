import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Language, translate, translations } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'cimplico_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      return savedLanguage;
    }
    
    // If no saved language, try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'zh') {
      return 'zh';
    }
    
    // Default to English
    return 'en';
  });
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    // Update HTML lang attribute for SEO and accessibility
    document.documentElement.lang = language;
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'zh' : 'en');
  };
  
  const t = (key: string) => {
    return translate(key, language);
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
