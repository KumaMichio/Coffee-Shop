// frontend/src/contexts/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ja, vi, en } from '../locales';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'ja'
    const savedLanguage = localStorage.getItem('app_language');
    return savedLanguage || 'ja';
  });

  const [translations, setTranslations] = useState(() => {
    const savedLanguage = localStorage.getItem('app_language') || 'ja';
    return savedLanguage === 'vi' ? vi : savedLanguage === 'en' ? en : ja;
  });

  useEffect(() => {
    // Cập nhật translations khi ngôn ngữ thay đổi
    let newTranslations;
    switch (language) {
      case 'vi':
        newTranslations = vi;
        break;
      case 'en':
        newTranslations = en;
        break;
      default:
        newTranslations = ja;
    }
    setTranslations(newTranslations);
    localStorage.setItem('app_language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (['ja', 'vi', 'en'].includes(lang)) {
      setLanguage(lang);
    }
  };

  const t = (key, params = {}) => {
    let translation = translations;
    const keys = key.split('.');
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        return key; // Trả về key nếu không tìm thấy
      }
    }

    if (typeof translation !== 'string') {
      return key;
    }

    // Thay thế params nếu có
    if (Object.keys(params).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

