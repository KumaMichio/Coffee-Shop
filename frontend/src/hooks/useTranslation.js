// frontend/src/hooks/useTranslation.js
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};

