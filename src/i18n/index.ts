/**
 * i18n configuration for Focus to GGSheet extension
 * Supports English (default) and Vietnamese with chrome.storage persistence
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import vi from './locales/vi.json'

/**
 * Get saved language preference from chrome.storage
 * Falls back to 'en' if not set or error
 */
const getSavedLanguage = async (): Promise<string> => {
  try {
    const result = await chrome.storage.local.get('language')
    return (result.language as string) || 'en'
  } catch (_error) {
    return 'en'
  }
}

/**
 * Initialize i18n with saved language preference
 * Must be called before rendering app
 */
export const initI18n = async () => {
  const savedLang = await getSavedLanguage()

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

  return i18n
}

/**
 * Change language and persist to chrome.storage
 */
export const changeLanguage = async (lang: 'en' | 'vi') => {
  await i18n.changeLanguage(lang)
  await chrome.storage.local.set({ language: lang })
}

export default i18n
