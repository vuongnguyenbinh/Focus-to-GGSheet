/**
 * Main panel for Prompt Library module
 * Displays prompts by type with filtering and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SearchBar, Modal } from '@/components/shared'
import {
  PromptTabBar,
  PromptList,
  PromptForm,
  PromptFilterPanel,
} from '@/components/features'
import {
  getAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  togglePromptFavorite,
  togglePromptApproved,
  getPromptCategories,
  getPromptTags,
} from '@/db/operations/prompt-operations'
import { promptSyncService } from '@/services/notion/prompt-sync-service'
import { useToast } from '@/stores/toast-context'
import type { Prompt, PromptType, PromptFormData, PromptFilterState } from '@/types'

interface PromptsPanelProps {
  isConfigured: boolean
  onOpenSettings?: () => void
}

export function PromptsPanel({ isConfigured, onOpenSettings }: PromptsPanelProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<PromptType>('text')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<PromptFilterState>({
    category: null,
    tags: [],
    approved: null,
    favorite: null,
  })
  const [showForm, setShowForm] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const toast = useToast()

  const loadPrompts = useCallback(async () => {
    const data = await getAllPrompts()
    setPrompts(data)
  }, [])

  const loadMetadata = useCallback(async () => {
    const [cats, tgs] = await Promise.all([
      getPromptCategories(),
      getPromptTags(),
    ])
    setCategories(cats)
    setTags(tgs)
  }, [])

  useEffect(() => {
    loadPrompts()
    loadMetadata()
  }, [loadPrompts, loadMetadata])

  // Filter prompts by type
  const promptsByType = prompts.filter((p) => p.type === activeTab)

  // Count by type
  const counts: Record<PromptType, number> = {
    text: prompts.filter((p) => p.type === 'text').length,
    image: prompts.filter((p) => p.type === 'image').length,
    video: prompts.filter((p) => p.type === 'video').length,
  }

  const handleCreate = async (data: PromptFormData) => {
    try {
      await createPrompt(data)
      await loadPrompts()
      await loadMetadata()
      setShowForm(false)
      toast.success(t('toast.saved'))
    } catch (error) {
      toast.error(t('toast.error') + ': ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleUpdate = async (data: PromptFormData) => {
    if (!editingPrompt) return
    try {
      await updatePrompt(editingPrompt.id, data)
      await loadPrompts()
      await loadMetadata()
      setEditingPrompt(null)
      setShowForm(false)
      toast.success(t('toast.saved'))
    } catch (error) {
      toast.error(t('toast.error') + ': ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('prompts.deleteConfirm'))) return
    try {
      await deletePrompt(id)
      await loadPrompts()
      await loadMetadata()
      toast.success(t('toast.deleted'))
    } catch (error) {
      toast.error(t('toast.error') + ': ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      await togglePromptFavorite(id)
      await loadPrompts()
    } catch (error) {
      toast.error(t('toast.error') + ': ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleToggleApproved = async (id: string) => {
    try {
      await togglePromptApproved(id)
      await loadPrompts()
    } catch (error) {
      toast.error(t('toast.error') + ': ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setShowForm(true)
  }

  const handleSync = async () => {
    if (!isConfigured) {
      toast.warning(t('prompts.configureHint'))
      onOpenSettings?.()
      return
    }

    setIsSyncing(true)
    try {
      const result = await promptSyncService.fullSync()
      if (result.success) {
        toast.success(t('prompts.syncResult', { created: result.created, updated: result.updated, deleted: result.deleted }))
        await loadPrompts()
        await loadMetadata()
      } else {
        toast.error(t('toast.syncError') + ': ' + result.errors.join(', '))
      }
    } catch (error) {
      toast.error(t('toast.syncError') + ': ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-color)]">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('prompts.search')}
        />
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`
            p-2 rounded-lg border border-[var(--border-color)]
            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
            ${isSyncing ? 'opacity-50' : ''}
          `}
          title={t('prompts.syncWithNotion')}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => {
            setEditingPrompt(null)
            setShowForm(true)
          }}
          className="p-2 rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors"
          title={t('prompts.new')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Type tabs */}
      <PromptTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Filter panel */}
      <PromptFilterPanel
        filter={filter}
        categories={categories}
        tags={tags}
        onChange={setFilter}
      />

      {/* Prompt list */}
      <div className="flex-1 overflow-y-auto">
        <PromptList
          prompts={promptsByType}
          filter={filter}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onToggleApproved={handleToggleApproved}
          onClick={handleEdit}
        />
      </div>

      {/* Form modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingPrompt(null)
        }}
      >
        <PromptForm
          type={activeTab}
          prompt={editingPrompt}
          categories={categories}
          tags={tags}
          onSubmit={editingPrompt ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false)
            setEditingPrompt(null)
          }}
        />
      </Modal>
    </div>
  )
}
