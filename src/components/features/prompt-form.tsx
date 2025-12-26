/**
 * Form for creating/editing prompts
 */

import { useState } from 'react'
import { X, Tag as TagIcon, Plus, Star, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Select, Tag, IconPicker } from '@/components/shared'
import type { Prompt, PromptType, PromptFormData, QualityRating } from '@/types'

interface PromptFormProps {
  type: PromptType
  prompt?: Prompt | null
  categories: string[]
  tags: string[]
  onSubmit: (data: PromptFormData) => void
  onCancel: () => void
}

type PromptTypeLabelKey = 'promptForm.typeText' | 'promptForm.typeImage' | 'promptForm.typeVideo'

const typeLabelKeys: Record<PromptType, PromptTypeLabelKey> = {
  text: 'promptForm.typeText',
  image: 'promptForm.typeImage',
  video: 'promptForm.typeVideo',
}

export function PromptForm({
  type,
  prompt,
  categories,
  tags,
  onSubmit,
  onCancel,
}: PromptFormProps) {
  const { t } = useTranslation()

  const qualityOptions = [
    { value: '', label: t('promptForm.noRating') },
    { value: '1', label: '★☆☆☆☆ (1)' },
    { value: '2', label: '★★☆☆☆ (2)' },
    { value: '3', label: '★★★☆☆ (3)' },
    { value: '4', label: '★★★★☆ (4)' },
    { value: '5', label: '★★★★★ (5)' },
  ]
  // Use prompt's type when editing, otherwise use the current tab type
  const effectiveType = prompt?.type || type

  const [title, setTitle] = useState(prompt?.title || '')
  const [description, setDescription] = useState(prompt?.description || '')
  const [promptContent, setPromptContent] = useState(prompt?.prompt || '')
  const [category, setCategory] = useState(prompt?.category || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(prompt?.tags || [])
  const [note, setNote] = useState(prompt?.note || '')
  const [approved, setApproved] = useState(prompt?.approved || false)
  const [favorite, setFavorite] = useState(prompt?.favorite || false)
  const [quality, setQuality] = useState<string>(prompt?.quality?.toString() || '')
  const [textDemo, setTextDemo] = useState(prompt?.textDemo || '')
  const [urlDemo, setUrlDemo] = useState(prompt?.urlDemo || '')

  const [showTagPicker, setShowTagPicker] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [copied, setCopied] = useState(false)

  const isEditing = !!prompt

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !promptContent.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      prompt: promptContent.trim(),
      type: effectiveType,
      category: category || null,
      tags: selectedTags,
      note: note.trim(),
      approved,
      favorite,
      quality: quality ? (parseInt(quality, 10) as QualityRating) : null,
      textDemo: textDemo.trim() || null,
      fileDemo: prompt?.fileDemo || null, // Keep existing file from Notion
      urlDemo: urlDemo.trim() || null,
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return
    if (!selectedTags.includes(newTag.trim())) {
      setSelectedTags((prev) => [...prev, newTag.trim()])
    }
    setNewTag('')
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    setCategory(newCategory.trim())
    setNewCategory('')
    setShowNewCategory(false)
  }

  // Include current category in options (for newly created categories not yet in database)
  const categoryOptions = [
    { value: '', label: t('form.noCategory') },
    ...categories.map((c) => ({ value: c, label: c })),
    // Add current category if it's not in the list (newly created)
    ...(category && !categories.includes(category) ? [{ value: category, label: category }] : []),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">
          {isEditing ? t('form.edit') : t('form.add')} prompt {t(typeLabelKeys[effectiveType])}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Title */}
      <Input
        label={t('form.title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('promptForm.titlePlaceholder')}
        required
        autoFocus
      />

      {/* Description */}
      <Input
        label={t('promptForm.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('promptForm.descriptionPlaceholder')}
      />

      {/* Main Prompt Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">{t('promptForm.content')} *</label>
          <button
            type="button"
            onClick={handleCopy}
            className={`
              flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
              ${copied
                ? 'bg-success/20 text-success'
                : 'text-brand hover:bg-brand/10'
              }
            `}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? t('prompts.copied') : t('prompts.copy')}
          </button>
        </div>
        <textarea
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          placeholder={t('promptForm.contentPlaceholder')}
          rows={6}
          required
          className="
            w-full px-3 py-2 rounded-lg border resize-none font-mono text-sm
            bg-[var(--bg-secondary)] border-[var(--border-color)]
            focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none
            transition-colors
          "
        />
      </div>

      {/* Category with inline create */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">{t('form.category')}</label>
          <button
            type="button"
            onClick={() => setShowNewCategory(!showNewCategory)}
            className="text-xs text-brand hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            {t('form.createNew')}
          </button>
        </div>
        {showNewCategory ? (
          <div className="flex gap-2 items-center p-2 rounded-lg border border-brand/50 bg-brand/5">
            <IconPicker
              value={newCategoryIcon}
              onChange={setNewCategoryIcon}
              size="sm"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder={t('form.categoryPlaceholder')}
              className="flex-1 h-8 px-2 text-sm rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
              autoFocus
            />
            <Button type="button" variant="primary" size="sm" onClick={handleAddCategory}>{t('common.add')}</Button>
            <button type="button" onClick={() => setShowNewCategory(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium flex items-center gap-1">
            <TagIcon className="w-3.5 h-3.5" />
            {t('form.tags')}
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-[var(--border-color)] min-h-[44px]">
          {selectedTags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              removable
              onRemove={() => toggleTag(tag)}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowTagPicker(!showTagPicker)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <TagIcon className="w-3 h-3" />
            {t('form.selectTags')}
          </button>
        </div>

        {showTagPicker && (
          <div className="mt-2 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            {/* New tag input */}
            <div className="flex gap-2 items-center mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t('form.tagPlaceholder')}
                className="flex-1 h-8 px-2 text-sm rounded border bg-[var(--bg-primary)] border-[var(--border-color)] focus:border-brand focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="primary" size="sm" onClick={handleAddTag}>{t('common.add')}</Button>
            </div>
            {/* Existing tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    label={tag}
                    onClick={() => toggleTag(tag)}
                    className={selectedTags.includes(tag) ? 'ring-2 ring-brand' : ''}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t('promptForm.note')}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('promptForm.notePlaceholder')}
          rows={2}
          className="
            w-full px-3 py-2 rounded-lg border resize-none
            bg-[var(--bg-secondary)] border-[var(--border-color)]
            focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none
            transition-colors text-sm
          "
        />
      </div>

      {/* Quality & Status */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t('promptForm.quality')}
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          options={qualityOptions}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">{t('promptForm.status')}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setApproved(!approved)}
              className={`
                flex-1 flex items-center justify-center gap-1 h-11 rounded-lg border text-sm transition-colors
                ${approved
                  ? 'bg-success/20 text-success border-success'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-success'
                }
              `}
            >
              <Check className="w-4 h-4" />
              {approved ? t('promptForm.approved') : t('promptForm.approve')}
            </button>
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`
                flex-1 flex items-center justify-center gap-1 h-11 rounded-lg border text-sm transition-colors
                ${favorite
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-500'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-yellow-500'
                }
              `}
            >
              <Star className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
              {favorite ? t('prompts.favorite') : t('promptForm.like')}
            </button>
          </div>
        </div>
      </div>

      {/* Demo fields */}
      <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-secondary)]">{t('promptForm.demoOptional')}</p>

        <Input
          label="URL Demo"
          type="url"
          value={urlDemo}
          onChange={(e) => setUrlDemo(e.target.value)}
          placeholder="https://..."
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">{t('promptForm.textDemo')}</label>
          <textarea
            value={textDemo}
            onChange={(e) => setTextDemo(e.target.value)}
            placeholder={t('promptForm.textDemoPlaceholder')}
            rows={2}
            className="
              w-full px-3 py-2 rounded-lg border resize-none
              bg-[var(--bg-secondary)] border-[var(--border-color)]
              focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none
              transition-colors text-sm
            "
          />
        </div>

        {/* File demo (display only, from Notion) */}
        {prompt?.fileDemo && (
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('promptForm.fileDemo')}</label>
            <a
              href={prompt.fileDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              {t('promptForm.viewFile')}
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" fullWidth>
          {isEditing ? t('common.save') : t('common.add')}
        </Button>
      </div>
    </form>
  )
}
