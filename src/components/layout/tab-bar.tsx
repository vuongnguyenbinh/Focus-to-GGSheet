import { CheckSquare, Bookmark, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ItemType } from '@/types'

interface TabBarProps {
  activeTab: ItemType
  onTabChange: (tab: ItemType) => void
  taskCount?: number
}

const tabConfig: { id: ItemType; labelKey: string; icon: typeof CheckSquare }[] = [
  { id: 'note', labelKey: 'tabs.notes', icon: FileText },
  { id: 'task', labelKey: 'tabs.tasks', icon: CheckSquare },
  { id: 'bookmark', labelKey: 'tabs.bookmarks', icon: Bookmark },
]

export function TabBar({ activeTab, onTabChange, taskCount }: TabBarProps) {
  const { t } = useTranslation()

  return (
    <nav className="flex border-b border-[var(--border-color)]">
      {tabConfig.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold
              transition-colors relative
              ${isActive
                ? 'text-brand'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t(tab.labelKey)}</span>
            {tab.id === 'task' && taskCount !== undefined && taskCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[11px] bg-brand text-white rounded-full min-w-[18px] text-center">
                {taskCount}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
