import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/i18n'

/**
 * Language toggle component - EN | VI text buttons
 * Displays in header, persists choice to chrome.storage
 */
export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  const handleToggle = async (lang: 'en' | 'vi') => {
    if (lang !== currentLang) {
      await changeLanguage(lang)
    }
  }

  return (
    <div className="flex items-center text-xs font-medium">
      <button
        onClick={() => handleToggle('en')}
        className={`px-1.5 py-0.5 rounded-l transition-colors ${
          currentLang === 'en'
            ? 'bg-brand text-white'
            : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => handleToggle('vi')}
        className={`px-1.5 py-0.5 rounded-r transition-colors ${
          currentLang === 'vi'
            ? 'bg-brand text-white'
            : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={t('common.vietnamese')}
      >
        VI
      </button>
    </div>
  )
}
