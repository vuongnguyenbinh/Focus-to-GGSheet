/**
 * Filter panel for prompts
 * Filter by category, tags, approved status, favorite
 */

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Tag as TagIcon, FolderOpen, CheckCircle, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tag } from '@/components/shared'
import type { PromptFilterState } from '@/types'

interface PromptFilterPanelProps {
  filter: PromptFilterState
  categories: string[]
  tags: string[]
  onChange: (filter: PromptFilterState) => void
}

export function PromptFilterPanel({
  filter,
  categories,
  tags,
  onChange,
}: PromptFilterPanelProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  // Count active filters
  const activeFilterCount = [
    filter.category,
    filter.tags.length > 0,
    filter.approved !== null,
    filter.favorite !== null,
  ].filter(Boolean).length

  const handleCategoryChange = (category: string | null) => {
    onChange({ ...filter, category })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter((t) => t !== tag)
      : [...filter.tags, tag]
    onChange({ ...filter, tags: newTags })
  }

  const handleApprovedChange = (approved: boolean | null) => {
    onChange({ ...filter, approved })
  }

  const handleFavoriteChange = (favorite: boolean | null) => {
    onChange({ ...filter, favorite })
  }

  const handleClearAll = () => {
    onChange({
      ...filter,
      category: null,
      tags: [],
      approved: null,
      favorite: null,
    })
  }

  return (
    <div className="border-b border-[var(--border-color)]">
      {/* Filter toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="font-medium">{t('filter.title')}</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-brand text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
        )}
      </button>

      {/* Filter content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Clear all button */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs text-error hover:underline"
            >
              <X className="w-3 h-3" />
              {t('filter.clearAll')}
            </button>
          )}

          {/* Status filters */}
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
              {t('filter.status')}
            </label>
            <div className="flex gap-1">
              {/* Approved filter */}
              <button
                onClick={() => handleApprovedChange(filter.approved === true ? null : true)}
                className={`
                  flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-colors
                  ${filter.approved === true
                    ? 'bg-success/20 text-success border-success'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-success'
                  }
                `}
              >
                <CheckCircle className="w-3 h-3" />
                {t('promptForm.approved')}
              </button>

              {/* Favorite filter */}
              <button
                onClick={() => handleFavoriteChange(filter.favorite === true ? null : true)}
                className={`
                  flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-colors
                  ${filter.favorite === true
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-500'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-yellow-500'
                  }
                `}
              >
                <Star className={`w-3 h-3 ${filter.favorite === true ? 'fill-current' : ''}`} />
                {t('prompts.favorite')}
              </button>
            </div>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                {t('filter.category')}
              </label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`
                    px-2 py-1 text-xs rounded-lg border transition-colors
                    ${!filter.category
                      ? 'bg-brand text-white border-brand'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                    }
                  `}
                >
                  {t('common.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`
                      px-2 py-1 text-xs rounded-lg border transition-colors
                      ${filter.category === category
                        ? 'bg-brand text-white border-brand'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags filter */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                <TagIcon className="w-3 h-3" />
                {t('filter.tags')}
              </label>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    label={tag}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className={`
                      cursor-pointer transition-all
                      ${filter.tags.includes(tag)
                        ? 'ring-2 ring-brand ring-offset-1'
                        : 'opacity-70 hover:opacity-100'
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {categories.length === 0 && tags.length === 0 && (
            <p className="text-xs text-[var(--text-secondary)] text-center py-2">
              {t('filter.noFilters')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
