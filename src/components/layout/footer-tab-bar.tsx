import { BarChart2, ClipboardList, Settings, Coffee, MessageCircle, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FooterTab, AuthorModalTab } from '@/types'

interface FooterTabBarProps {
  activeTab: FooterTab | null
  onTabChange: (tab: FooterTab | null) => void
  onOpenAuthorModal?: (tab: AuthorModalTab) => void
}

const tabConfig: { id: FooterTab; labelKey: string; icon: typeof BarChart2 }[] = [
  { id: 'analytics', labelKey: 'footer.analytics', icon: BarChart2 },
  { id: 'logs', labelKey: 'footer.journal', icon: ClipboardList },
  { id: 'settings', labelKey: 'footer.settings', icon: Settings },
]

export function FooterTabBar({ activeTab, onTabChange, onOpenAuthorModal }: FooterTabBarProps) {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      {/* Footer tabs */}
      <nav className="flex">
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(isActive ? null : tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold
                transition-colors
                ${isActive
                  ? 'text-brand'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </nav>

      {/* Author links row */}
      {onOpenAuthorModal && (
        <div className="flex justify-center gap-4 py-1.5 border-t border-[var(--border-color)]">
          <button
            onClick={() => onOpenAuthorModal('coffee')}
            className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <Coffee className="w-3 h-3" />
            <span>{t('footer.coffee')}</span>
          </button>
          <button
            onClick={() => onOpenAuthorModal('request')}
            className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            <span>{t('footer.request')}</span>
          </button>
          <button
            onClick={() => onOpenAuthorModal('intro')}
            className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>{t('footer.about')}</span>
          </button>
        </div>
      )}

      {/* Credit line */}
      <div className="text-center text-[10px] text-[var(--text-secondary)] py-1 border-t border-[var(--border-color)]">
        {t('footer.credit')}{' '}
        <a
          href="https://binhvuong.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline"
        >
          Binh Vuong AI Marketing
        </a>
      </div>
    </footer>
  )
}
