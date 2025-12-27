import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Info, Coffee, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuthorModalTab } from '@/types'
import { IntroTab } from './intro-tab'
import { CoffeeTab } from './coffee-tab'
import { RequestTab } from './request-tab'

interface AuthorModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: AuthorModalTab
}

const tabConfig: { id: AuthorModalTab; labelKey: string; icon: typeof Info }[] = [
  { id: 'intro', labelKey: 'footer.about', icon: Info },
  { id: 'coffee', labelKey: 'footer.coffee', icon: Coffee },
  { id: 'request', labelKey: 'footer.request', icon: MessageCircle },
]

/**
 * Author support modal with tabbed navigation
 * Tabs: Introduction | Coffee invitation | Feature request
 */
export function AuthorModal({ isOpen, onClose, defaultTab = 'intro' }: AuthorModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<AuthorModalTab>(defaultTab)

  // Sync activeTab when defaultTab changes (when opening from different sources)
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
    }
  }, [isOpen, defaultTab])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9000] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="max-w-md w-full max-h-[80vh] flex flex-col rounded-xl shadow-xl pointer-events-auto bg-[var(--bg-primary)] text-[var(--text-primary)] animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-lg font-semibold">{t('author.title')}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-[var(--border-color)]">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                    border-b-2 transition-colors
                    ${isActive
                      ? 'border-brand text-brand'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t(tab.labelKey)}</span>
                </button>
              )
            })}
          </div>

          {/* Tab content with scroll */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'intro' && <IntroTab />}
            {activeTab === 'coffee' && <CoffeeTab />}
            {activeTab === 'request' && <RequestTab onClose={onClose} />}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
