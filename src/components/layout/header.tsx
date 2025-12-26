import { RefreshCw, Sun, Moon, Coffee, MessageCircle } from 'lucide-react'
import { useTheme } from '@/stores/theme-context'
import type { AuthorModalTab } from '@/types'

interface HeaderProps {
  isSyncing?: boolean
  onSync?: () => void
  onOpenAuthorModal?: (tab: AuthorModalTab) => void
}

export function Header({ isSyncing, onSync, onOpenAuthorModal }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-2">
        <img
          src={chrome.runtime.getURL('icons/icon-32.png')}
          alt="Logo"
          className="w-6 h-6"
        />
        <span className="text-sm font-bold">Focus to Notion</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Đồng bộ"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        {onOpenAuthorModal && (
          <>
            <button
              onClick={() => onOpenAuthorModal('coffee')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Mời cà phê"
            >
              <Coffee className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuthorModal('request')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Yêu cầu tính năng"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
