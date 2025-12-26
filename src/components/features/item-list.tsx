import { useMemo } from 'react'
import { Plus, Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ItemCard } from './item-card'
import { Button } from '@/components/shared'
import type { Item, ItemType, Tag, FilterState } from '@/types'

interface ItemListProps {
  items: Item[]
  type: ItemType
  tags: Tag[]
  filter: FilterState
  onAdd: () => void
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onClick: (item: Item) => void
}

type TypeLabelKey = 'list.taskSingular' | 'list.taskEmpty' | 'list.bookmarkSingular' | 'list.bookmarkEmpty' | 'list.noteSingular' | 'list.noteEmpty'

const typeLabelKeys: Record<ItemType, { singular: TypeLabelKey; empty: TypeLabelKey }> = {
  task: {
    singular: 'list.taskSingular',
    empty: 'list.taskEmpty',
  },
  bookmark: {
    singular: 'list.bookmarkSingular',
    empty: 'list.bookmarkEmpty',
  },
  note: {
    singular: 'list.noteSingular',
    empty: 'list.noteEmpty',
  },
}

export function ItemList({
  items,
  type,
  tags,
  filter,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
  onClick,
}: ItemListProps) {
  const { t } = useTranslation()

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (item.type !== type) return false

      // Search filter
      if (filter.search) {
        const search = filter.search.toLowerCase()
        if (
          !item.title.toLowerCase().includes(search) &&
          !item.content.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      // Status filter (tasks only)
      if (type === 'task' && filter.status !== 'all') {
        if (filter.status === 'pending' && item.completed) return false
        if (filter.status === 'completed' && !item.completed) return false
      }

      // Category filter
      if (filter.categoryId && item.categoryId !== filter.categoryId) return false

      // Project filter
      if (filter.projectId && item.projectId !== filter.projectId) return false

      // Tags filter
      if (filter.tagIds.length > 0) {
        if (!filter.tagIds.some((tagId) => item.tags.includes(tagId))) return false
      }

      return true
    })
  }, [items, type, filter])

  // Sort items: incomplete first, then by updatedAt
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (type === 'task') {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [filteredItems, type])

  const labelKeys = typeLabelKeys[type]

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
        <Inbox className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">{t(labelKeys.empty)}</p>
        <p className="text-xs mt-1">{t('list.addHint', { type: t(labelKeys.singular) })}</p>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
          className="mt-4"
        >
          {t('list.add', { type: t(labelKeys.singular) })}
        </Button>
      </div>
    )
  }

  // Group completed tasks separately
  const pendingItems = type === 'task' ? sortedItems.filter((i) => !i.completed) : sortedItems
  const completedItems = type === 'task' ? sortedItems.filter((i) => i.completed) : []

  return (
    <div className="space-y-2 animate-stagger">
      {/* Pending/Active items */}
      {pendingItems.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          tags={tags}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onClick={onClick}
        />
      ))}

      {/* Completed section (tasks only) */}
      {completedItems.length > 0 && (
        <div className="pt-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {t('list.completed', { count: completedItems.length })}
            </span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>
          {completedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              tags={tags}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
