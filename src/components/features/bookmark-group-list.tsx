/**
 * Bookmark list grouped by category with expand/collapse functionality
 * Displays bookmarks organized by category with favicon and URL preview
 */

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, FolderOpen, MoreHorizontal, Edit2, Trash2, Inbox, ChevronsUpDown, ChevronsDownUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Item, Category, Tag, FilterState } from '@/types'
import { Tag as TagComponent, CategoryIcon, DropdownMenu, DropdownMenuItem } from '@/components/shared'

interface BookmarkGroupListProps {
  bookmarks: Item[]
  categories: Category[]
  tags: Tag[]
  filter: FilterState
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
  onClick: (item: Item) => void
}

interface CategoryGroup {
  category: Category | null // null = uncategorized
  bookmarks: Item[]
}

export function BookmarkGroupList({
  bookmarks,
  categories,
  tags,
  filter,
  onEdit,
  onDelete,
  onClick,
}: BookmarkGroupListProps) {
  const { t } = useTranslation()
  // Track expanded categories (collapsed by default)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  // Filter bookmarks first
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      // Search filter
      if (filter.search) {
        const search = filter.search.toLowerCase()
        if (
          !bookmark.title.toLowerCase().includes(search) &&
          !bookmark.content.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      // Category filter
      if (filter.categoryId && bookmark.categoryId !== filter.categoryId) return false

      // Project filter
      if (filter.projectId && bookmark.projectId !== filter.projectId) return false

      // Tags filter
      if (filter.tagIds.length > 0) {
        if (!filter.tagIds.some((tagId) => bookmark.tags.includes(tagId))) return false
      }

      return true
    })
  }, [bookmarks, filter])

  // Group filtered bookmarks by category
  const groupedBookmarks = useMemo(() => {
    const groups: CategoryGroup[] = []
    const categoryMap = new Map<string | null, Item[]>()

    // Initialize groups
    categoryMap.set(null, []) // Uncategorized

    // Group bookmarks
    for (const bookmark of filteredBookmarks) {
      const catId = bookmark.categoryId
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, [])
      }
      categoryMap.get(catId)!.push(bookmark)
    }

    // Build groups with category info
    for (const [catId, items] of categoryMap) {
      if (items.length === 0) continue

      const category = catId ? categories.find((c) => c.id === catId) || null : null
      groups.push({ category, bookmarks: items })
    }

    // Sort: categories first (by order), uncategorized last
    groups.sort((a, b) => {
      if (!a.category && b.category) return 1
      if (a.category && !b.category) return -1
      if (!a.category && !b.category) return 0
      return (a.category?.order || 0) - (b.category?.order || 0)
    })

    return groups
  }, [filteredBookmarks, categories])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const getCategoryKey = (category: Category | null) => category?.id || 'uncategorized'

  // Expand/collapse all
  const expandAll = () => {
    setExpandedCategories(new Set(['uncategorized', ...categories.map((c) => c.id)]))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  const allExpanded = expandedCategories.size === groupedBookmarks.length

  // Empty state
  if (filteredBookmarks.length === 0) {
    const hasFilters = filter.categoryId || filter.projectId || filter.tagIds.length > 0 || filter.search
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
        <Inbox className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">
          {hasFilters ? t('bookmarkList.noMatchingBookmarks') : t('bookmarks.empty')}
        </p>
        <p className="text-xs mt-1">
          {hasFilters ? t('bookmarkList.tryChangingFilters') : t('bookmarks.emptyHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Expand/Collapse All Buttons - two separate buttons side by side */}
      {groupedBookmarks.length > 0 && (
        <div className="flex justify-end gap-1 mb-1">
          <button
            onClick={expandAll}
            disabled={allExpanded}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors rounded-lg border ${
              allExpanded
                ? 'text-[var(--text-secondary)] bg-gray-100 dark:bg-gray-700 border-transparent cursor-not-allowed opacity-50'
                : 'text-[var(--text-primary)] bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand border-[var(--border-color)]'
            }`}
            title={t('bookmarkList.expandAll')}
          >
            <ChevronsUpDown className="w-4 h-4" />
            <span>{t('bookmarkList.expand')}</span>
          </button>
          <button
            onClick={collapseAll}
            disabled={expandedCategories.size === 0}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors rounded-lg border ${
              expandedCategories.size === 0
                ? 'text-[var(--text-secondary)] bg-gray-100 dark:bg-gray-700 border-transparent cursor-not-allowed opacity-50'
                : 'text-[var(--text-primary)] bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand border-[var(--border-color)]'
            }`}
            title={t('bookmarkList.collapseAll')}
          >
            <ChevronsDownUp className="w-4 h-4" />
            <span>{t('bookmarkList.collapse')}</span>
          </button>
        </div>
      )}

      <div className="space-y-2 animate-stagger">
        {groupedBookmarks.map((group) => {
        const categoryKey = getCategoryKey(group.category)
        const isExpanded = expandedCategories.has(categoryKey)

        return (
          <div
            key={categoryKey}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
          >
            {/* Category header - clickable to expand/collapse */}
            <button
              onClick={() => toggleCategory(categoryKey)}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              )}

              {group.category ? (
                <>
                  <CategoryIcon name={group.category.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{group.category.name}</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{t('bookmarkList.uncategorized')}</span>
                </>
              )}

              <span className="ml-auto text-xs text-[var(--text-secondary)] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                {group.bookmarks.length}
              </span>
            </button>

            {/* Bookmark list */}
            {isExpanded && (
              <div className="border-t border-[var(--border-color)] animate-expand">
                {group.bookmarks.map((bookmark) => (
                  <BookmarkRow
                    key={bookmark.id}
                    bookmark={bookmark}
                    tags={tags}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onClick}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}

// Individual bookmark row component
interface BookmarkRowProps {
  bookmark: Item
  tags: Tag[]
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
  onClick: (item: Item) => void
}

function BookmarkRow({ bookmark, tags, onEdit, onDelete, onClick }: BookmarkRowProps) {
  const { t } = useTranslation()
  const itemTags = tags.filter((t) => bookmark.tags.includes(t.id))

  // Safely parse URL hostname
  let hostname: string | null = null
  if (bookmark.url) {
    try {
      hostname = new URL(bookmark.url).hostname
    } catch {
      // Invalid URL, keep hostname as null
    }
  }

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-[var(--border-color)] last:border-b-0"
      onClick={() => onClick(bookmark)}
    >
      {/* Favicon */}
      {bookmark.faviconUrl ? (
        <img
          src={bookmark.faviconUrl}
          alt=""
          className="w-4 h-4 rounded-sm flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="w-4 h-4 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
        </div>
      )}

      {/* Title, URL, and Description */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{bookmark.title}</div>
        {hostname && (
          <div className="text-xs text-brand truncate">{hostname}</div>
        )}
        {bookmark.content && (
          <div className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">{bookmark.content}</div>
        )}
      </div>

      {/* Tags */}
      {itemTags.length > 0 && (
        <div className="hidden sm:flex gap-1">
          {itemTags.slice(0, 2).map((tag) => (
            <TagComponent key={tag.id} label={tag.name} color={tag.color} size="sm" />
          ))}
          {itemTags.length > 2 && (
            <span className="text-[10px] text-[var(--text-secondary)]">+{itemTags.length - 2}</span>
          )}
        </div>
      )}

      {/* Open link button */}
      {bookmark.url && (
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--text-secondary)] hover:text-brand transition-colors"
          title={t('bookmarkList.openLink')}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {/* Menu - using DropdownMenu with Portal to avoid clipping */}
      <DropdownMenu
        trigger={<MoreHorizontal className="w-4 h-4" />}
        triggerClassName="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      >
        <DropdownMenuItem
          icon={<Edit2 className="w-3.5 h-3.5" />}
          label={t('common.edit')}
          onClick={() => onEdit(bookmark)}
        />
        <DropdownMenuItem
          icon={<Trash2 className="w-3.5 h-3.5" />}
          label={t('common.delete')}
          onClick={() => onDelete(bookmark.id)}
          variant="danger"
        />
      </DropdownMenu>
    </div>
  )
}
