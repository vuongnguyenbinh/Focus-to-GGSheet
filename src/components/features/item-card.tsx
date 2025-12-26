import {
  CheckCircle,
  Circle,
  Bookmark,
  FileText,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tag, DropdownMenu, DropdownMenuItem } from '@/components/shared'
import type { Item, Tag as TagType, Priority } from '@/types'

interface ItemCardProps {
  item: Item
  tags?: TagType[]
  onToggleComplete?: (id: string, completed: boolean) => void
  onEdit?: (item: Item) => void
  onDelete?: (id: string) => void
  onClick?: (item: Item) => void
}

const priorityColors: Record<Priority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
}

type PriorityLabelKey = 'tasks.priorityHigh' | 'tasks.priorityMedium' | 'tasks.priorityLow'

const priorityLabelKeys: Record<Priority, PriorityLabelKey> = {
  high: 'tasks.priorityHigh',
  medium: 'tasks.priorityMedium',
  low: 'tasks.priorityLow',
}

export function ItemCard({
  item,
  tags = [],
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
}: ItemCardProps) {
  const { t, i18n } = useTranslation()
  const itemTags = tags.filter((tag) => item.tags.includes(tag.id))

  const formatDeadline = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return t('card.overdue')
    if (days === 0) return t('card.today')
    if (days === 1) return t('card.tomorrow')
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short' })
  }

  const isOverdue = item.deadline && new Date(item.deadline) < new Date() && !item.completed

  return (
    <div
      className={`
        group p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)]
        hover:border-brand/50 transition-colors cursor-pointer
        ${item.completed ? 'opacity-60' : ''}
      `}
      onClick={() => onClick?.(item)}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox for tasks */}
        {item.type === 'task' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete?.(item.id, !item.completed)
            }}
            className="mt-0.5 text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Icon for bookmarks - show favicon if available */}
        {item.type === 'bookmark' && (
          item.faviconUrl ? (
            <img
              src={item.faviconUrl}
              alt=""
              className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-sm"
              onError={(e) => {
                // Fallback to bookmark icon if favicon fails to load
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null
        )}
        {item.type === 'bookmark' && (
          <Bookmark className={`w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0 ${item.faviconUrl ? 'hidden' : ''}`} />
        )}
        {item.type === 'note' && (
          <FileText className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`
                text-sm font-medium line-clamp-2
                ${item.completed ? 'line-through text-[var(--text-secondary)]' : ''}
              `}
            >
              {item.title}
            </h3>

            {/* Menu button - using DropdownMenu with Portal to avoid clipping */}
            <DropdownMenu
              trigger={<MoreHorizontal className="w-4 h-4" />}
              triggerClassName="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <DropdownMenuItem
                icon={<Edit2 className="w-3.5 h-3.5" />}
                label={t('common.edit')}
                onClick={() => onEdit?.(item)}
              />
              <DropdownMenuItem
                icon={<Trash2 className="w-3.5 h-3.5" />}
                label={t('common.delete')}
                onClick={() => onDelete?.(item.id)}
                variant="danger"
              />
            </DropdownMenu>
          </div>

          {/* URL for bookmarks - show prominently */}
          {item.type === 'bookmark' && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 flex items-center gap-1 text-xs text-brand hover:underline"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{new URL(item.url).hostname}</span>
            </a>
          )}

          {/* Content/Description preview */}
          {item.content && (
            <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2">
              {item.content}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            {/* Priority */}
            {item.priority && (
              <span
                className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                style={{
                  backgroundColor: `${priorityColors[item.priority]}20`,
                  color: priorityColors[item.priority],
                }}
              >
                {t(priorityLabelKeys[item.priority])}
              </span>
            )}

            {/* Deadline */}
            {item.deadline && (
              <span
                className={`
                  flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full
                  ${isOverdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {isOverdue ? <Clock className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                {formatDeadline(new Date(item.deadline))}
              </span>
            )}

            {/* Tags */}
            {itemTags.map((tag) => (
              <Tag key={tag.id} label={tag.name} color={tag.color} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
