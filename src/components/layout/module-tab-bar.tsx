/**
 * Module switcher bar (Items / Prompts)
 * Placed below header at top of sidebar
 */

import { Library, ListTodo } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModuleTab } from '@/types'

interface ModuleTabBarProps {
  activeModule: ModuleTab
  onModuleChange: (module: ModuleTab) => void
}

const moduleConfig: { id: ModuleTab; labelKey: string; icon: typeof Library }[] = [
  { id: 'items', labelKey: 'tabs.items', icon: ListTodo },
  { id: 'prompts', labelKey: 'tabs.prompts', icon: Library },
]

export function ModuleTabBar({ activeModule, onModuleChange }: ModuleTabBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
      {moduleConfig.map((mod) => {
        const Icon = mod.icon
        const isActive = activeModule === mod.id
        return (
          <button
            key={mod.id}
            onClick={() => onModuleChange(mod.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold
              transition-colors border-b-2
              ${isActive
                ? 'text-brand border-brand'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{t(mod.labelKey)}</span>
          </button>
        )
      })}
    </div>
  )
}
