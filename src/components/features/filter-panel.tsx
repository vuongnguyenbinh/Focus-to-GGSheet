/**
 * Filter panel component for filtering items by tag, category, and project
 * Collapsible design to save space in sidebar
 */

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Tag as TagIcon, FolderOpen, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tag, CategoryIcon, CATEGORY_ICONS } from '@/components/shared'
import type { Category, Project, Tag as TagType, FilterState, ItemType } from '@/types'

// Check if icon is a lucide icon name or old emoji
const isLucideIcon = (icon: string) => CATEGORY_ICONS.some((i) => i.name === icon)

interface FilterPanelProps {
  filter: FilterState
  categories: Category[]
  projects: Project[]
  tags: TagType[]
  activeTab: ItemType
  onChange: (filter: FilterState) => void
}

export function FilterPanel({
  filter,
  categories,
  projects,
  tags,
  activeTab,
  onChange,
}: FilterPanelProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  // Count active filters
  const activeFilterCount = [
    filter.categoryId,
    filter.projectId,
    filter.tagIds.length > 0,
    filter.status !== 'all',
  ].filter(Boolean).length

  const handleCategoryChange = (categoryId: string | null) => {
    onChange({ ...filter, categoryId })
  }

  const handleProjectChange = (projectId: string | null) => {
    onChange({ ...filter, projectId })
  }

  const handleTagToggle = (tagId: string) => {
    const newTagIds = filter.tagIds.includes(tagId)
      ? filter.tagIds.filter((id) => id !== tagId)
      : [...filter.tagIds, tagId]
    onChange({ ...filter, tagIds: newTagIds })
  }

  const handleStatusChange = (status: 'all' | 'pending' | 'completed') => {
    onChange({ ...filter, status })
  }

  const handleClearAll = () => {
    onChange({
      ...filter,
      categoryId: null,
      projectId: null,
      tagIds: [],
      status: 'all',
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

          {/* Status filter (tasks only) */}
          {activeTab === 'task' && (
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                {t('filter.status')}
              </label>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: t('common.all') },
                  { value: 'pending', label: t('filter.statusPending') },
                  { value: 'completed', label: t('filter.statusCompleted') },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value as 'all' | 'pending' | 'completed')}
                    className={`
                      flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors
                      ${filter.status === option.value
                        ? 'bg-brand text-white border-brand'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                    ${!filter.categoryId
                      ? 'bg-brand text-white border-brand'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                    }
                  `}
                >
                  {t('common.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`
                      px-2 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1
                      ${filter.categoryId === category.id
                        ? 'bg-brand text-white border-brand'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                      }
                    `}
                  >
                    {isLucideIcon(category.icon) ? (
                      <CategoryIcon name={category.icon} className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">{category.icon}</span>
                    )}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project filter */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {t('filter.project')}
              </label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleProjectChange(null)}
                  className={`
                    px-2 py-1 text-xs rounded-lg border transition-colors
                    ${!filter.projectId
                      ? 'bg-brand text-white border-brand'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                    }
                  `}
                >
                  {t('common.all')}
                </button>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectChange(project.id)}
                    className={`
                      px-2 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1
                      ${filter.projectId === project.id
                        ? 'bg-brand text-white border-brand'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-brand'
                      }
                    `}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
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
                    key={tag.id}
                    label={tag.name}
                    color={tag.color}
                    size="sm"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`
                      cursor-pointer transition-all
                      ${filter.tagIds.includes(tag.id)
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
          {categories.length === 0 && projects.length === 0 && tags.length === 0 && activeTab !== 'task' && (
            <p className="text-xs text-[var(--text-secondary)] text-center py-2">
              {t('filter.noFilters')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
