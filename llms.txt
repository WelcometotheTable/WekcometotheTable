import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

function detectLocale(): Locale {
  const stored = localStorage.getItem('locale');
  if (stored === 'en' || stored === 'es' || stored === 'fr') return stored;
  const nav = navigator.language.slice(0, 2);
  return nav === 'es' || nav === 'fr' ? nav : 'en';
}

await i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es }, fr: { translation: fr } },
  lng: detectLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
