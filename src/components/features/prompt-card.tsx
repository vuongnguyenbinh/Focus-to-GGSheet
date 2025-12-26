/**
 * Card component for displaying a prompt
 */

import { useState } from 'react'
import {
  Copy,
  Check,
  Star,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tag } from '@/components/shared'
import type { Prompt } from '@/types'

interface PromptCardProps {
  prompt: Prompt
  onEdit?: (prompt: Prompt) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onToggleApproved?: (id: string) => void
  onClick?: (prompt: Prompt) => void
}

const qualityStars = (rating: number | null) => {
  if (!rating) return null
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleApproved,
  onClick,
}: PromptCardProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(prompt.id)
  }

  const handleApproved = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleApproved?.(prompt.id)
  }

  return (
    <div
      className={`
        group p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)]
        hover:border-brand/50 transition-colors cursor-pointer
      `}
      onClick={() => onClick?.(prompt)}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium line-clamp-1">
              {prompt.title}
            </h3>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`
                  p-1.5 rounded transition-all
                  ${copied
                    ? 'bg-success/20 text-success'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={t('prompts.copy')}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Favorite toggle */}
              <button
                onClick={handleFavorite}
                className={`
                  p-1.5 rounded transition-all
                  ${prompt.favorite
                    ? 'text-yellow-500'
                    : 'opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-yellow-500'
                  }
                `}
                title={prompt.favorite ? t('promptCard.removeFavorite') : t('prompts.favorite')}
              >
                <Star className={`w-3.5 h-3.5 ${prompt.favorite ? 'fill-current' : ''}`} />
              </button>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onEdit?.(prompt)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onDelete?.(prompt.id)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-error hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {prompt.description && (
            <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2">
              {prompt.description}
            </p>
          )}
        </div>
      </div>

      {/* Prompt preview */}
      <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-gray-800/50 border border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-secondary)] line-clamp-3 font-mono">
          {prompt.prompt}
        </p>
      </div>

      {/* Demo links */}
      {(prompt.textDemo || prompt.urlDemo || prompt.fileDemo) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {prompt.urlDemo && (
            <a
              href={prompt.urlDemo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-brand hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Demo
            </a>
          )}
          {prompt.fileDemo && (
            <a
              href={prompt.fileDemo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-brand hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              File
            </a>
          )}
        </div>
      )}

      {/* Meta info */}
      <div className="mt-2 flex items-center flex-wrap gap-1.5">
        {/* Approved badge */}
        {prompt.approved && (
          <button
            onClick={handleApproved}
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full bg-success/20 text-success"
            title={t('promptForm.approved')}
          >
            <CheckCircle className="w-2.5 h-2.5" />
            {t('promptForm.approved')}
          </button>
        )}

        {/* Quality rating */}
        {prompt.quality && (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
            {qualityStars(prompt.quality)}
          </span>
        )}

        {/* Category */}
        {prompt.category && (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            {prompt.category}
          </span>
        )}

        {/* Tags */}
        {prompt.tags.map((tag) => (
          <Tag key={tag} label={tag} size="sm" />
        ))}
      </div>
    </div>
  )
}
