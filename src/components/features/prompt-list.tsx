/**
 * List component for displaying prompts with filtering
 */

import { useTranslation } from 'react-i18next'
import { PromptCard } from './prompt-card'
import type { Prompt, PromptFilterState } from '@/types'

interface PromptListProps {
  prompts: Prompt[]
  filter: PromptFilterState
  searchQuery: string
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleApproved: (id: string) => void
  onClick: (prompt: Prompt) => void
}

export function PromptList({
  prompts,
  filter,
  searchQuery,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleApproved,
  onClick,
}: PromptListProps) {
  const { t } = useTranslation()
  // Apply filters
  const filteredPrompts = prompts.filter((prompt) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.prompt.toLowerCase().includes(query) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Category filter
    if (filter.category && prompt.category !== filter.category) {
      return false
    }

    // Tags filter
    if (filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some((tag) => prompt.tags.includes(tag))
      if (!hasMatchingTag) return false
    }

    // Approved filter
    if (filter.approved !== null && prompt.approved !== filter.approved) {
      return false
    }

    // Favorite filter
    if (filter.favorite !== null && prompt.favorite !== filter.favorite) {
      return false
    }

    return true
  })

  // Sort: favorites first, then by updatedAt
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (a.favorite !== b.favorite) return b.favorite ? 1 : -1
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  if (sortedPrompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[var(--text-secondary)]">
          {searchQuery || filter.category || filter.tags.length > 0 || filter.approved !== null || filter.favorite !== null
            ? t('promptList.noMatchingPrompts')
            : t('prompts.empty')}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {searchQuery || filter.category || filter.tags.length > 0 || filter.approved !== null || filter.favorite !== null
            ? t('promptList.tryChangingFilters')
            : t('prompts.emptyHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-3 animate-stagger">
      {sortedPrompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onToggleApproved={onToggleApproved}
          onClick={onClick}
        />
      ))}
    </div>
  )
}
