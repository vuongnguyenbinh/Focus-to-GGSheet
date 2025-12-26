import { useState } from 'react'
import { X, Calendar, Tag as TagIcon, Plus, FolderOpen, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Select, Tag, IconPicker, ColorPicker, TAG_COLORS, CategoryIcon, CATEGORY_ICONS } from '@/components/shared'
import { createTag } from '@/db/operations/tag-operations'
import { createCategory } from '@/db/operations/category-operations'
import { createProject } from '@/db/operations/project-operations'
import type {
  Item,
  ItemType,
  ItemFormData,
  Priority,
  Category,
  Project,
  Tag as TagType,
} from '@/types'

// Use TAG_COLORS from color-picker for consistency

type TypeLabelKey = 'form.typeTask' | 'form.typeBookmark' | 'form.typeNote'

interface PrefillData {
  title?: string
  content?: string
  url?: string
}

interface ItemFormProps {
  type: ItemType
  item?: Item | null
  prefill?: PrefillData | null // Prefill data from URL drop
  categories: Category[]
  projects: Project[]
  tags: TagType[]
  onSubmit: (data: ItemFormData) => void
  onCancel: () => void
  onMetadataChange?: () => void // Callback to refresh metadata after creating new tag/category/project
}

const typeLabelKeys: Record<ItemType, TypeLabelKey> = {
  task: 'form.typeTask',
  bookmark: 'form.typeBookmark',
  note: 'form.typeNote',
}

export function ItemForm({
  type,
  item,
  prefill,
  categories,
  projects,
  tags,
  onSubmit,
  onCancel,
  onMetadataChange,
}: ItemFormProps) {
  const { t } = useTranslation()

  const priorityOptions = [
    { value: '', label: t('form.noPriority') },
    { value: 'high', label: t('tasks.priorityHigh') },
    { value: 'medium', label: t('tasks.priorityMedium') },
    { value: 'low', label: t('tasks.priorityLow') },
  ]

  // Use prefill data if no item (for URL drops)
  const [title, setTitle] = useState(item?.title || prefill?.title || '')
  const [content, setContent] = useState(item?.content || prefill?.content || '')
  const [url, setUrl] = useState(item?.url || prefill?.url || '')
  const [priority, setPriority] = useState<Priority | ''>(item?.priority || '')
  const [deadline, setDeadline] = useState(
    item?.deadline ? new Date(item.deadline).toISOString().split('T')[0] : ''
  )
  const [categoryId, setCategoryId] = useState(item?.categoryId || '')
  const [projectId, setProjectId] = useState(item?.projectId || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(item?.tags || [])
  const [showTagPicker, setShowTagPicker] = useState(false)

  // Inline create states
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)

  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder')

  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState(TAG_COLORS[4].value)

  const isEditing = !!item

  // Inline create handlers
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    const tag = await createTag({ name: newTagName.trim(), color: newTagColor })
    setSelectedTags((prev) => [...prev, tag.id])
    setNewTagName('')
    setNewTagColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value)
    setShowNewTag(false)
    onMetadataChange?.()
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const category = await createCategory({ name: newCategoryName.trim(), icon: newCategoryIcon, parentId: null })
    setCategoryId(category.id)
    setNewCategoryName('')
    setNewCategoryIcon('folder')
    setShowNewCategory(false)
    onMetadataChange?.()
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    const project = await createProject({ name: newProjectName.trim(), color: newProjectColor })
    setProjectId(project.id)
    setNewProjectName('')
    setNewProjectColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value)
    setShowNewProject(false)
    onMetadataChange?.()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      type,
      title: title.trim(),
      content: content.trim(),
      url: url.trim() || undefined,
      priority: priority || undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      categoryId: categoryId || undefined,
      projectId: projectId || undefined,
      tags: selectedTags,
    })
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  // Check if icon is a lucide icon name or old emoji
  const isLucideIcon = (icon: string) => CATEGORY_ICONS.some((i) => i.name === icon)

  const projectOptions = [
    { value: '', label: t('form.noProject') },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">
          {isEditing ? t('form.edit') : t('form.add')} {t(typeLabelKeys[type])}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Input
        label={t('form.title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('form.titlePlaceholder')}
        required
        autoFocus
      />

      {type === 'bookmark' && (
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5">{t('form.content')}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === 'note' ? t('form.notePlaceholder') : t('form.descriptionPlaceholder')}
          rows={type === 'note' ? 6 : 3}
          className="
            w-full px-3 py-2 rounded-lg border resize-none
            bg-[var(--bg-secondary)] border-[var(--border-color)]
            focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none
            transition-colors text-sm
          "
        />
      </div>

      {type === 'task' && (
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={t('form.priority')}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
            options={priorityOptions}
          />
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('form.deadline')}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="
                  w-full h-11 px-3 pl-10 rounded-lg border
                  bg-[var(--bg-secondary)] border-[var(--border-color)]
                  focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none
                  transition-colors text-sm
                "
              />
            </div>
          </div>
        </div>
      )}

      {/* Category with inline create */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5" />
            {t('form.category')}
          </label>
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
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('form.categoryPlaceholder')}
              className="flex-1 h-8 px-2 text-sm rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
              autoFocus
            />
            <Button type="button" variant="primary" size="sm" onClick={handleCreateCategory}>{t('form.create')}</Button>
            <button type="button" onClick={() => setShowNewCategory(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`w-full h-11 pr-8 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition-colors text-sm appearance-none ${categoryId ? 'pl-9' : 'px-3'}`}
            >
              <option value="">{t('form.noCategory')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {/* Show selected category with proper icon */}
            {categoryId && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                {(() => {
                  const cat = categories.find((c) => c.id === categoryId)
                  if (!cat) return null
                  return isLucideIcon(cat.icon) ? (
                    <CategoryIcon name={cat.icon} className="w-4 h-4 text-[var(--text-primary)]" />
                  ) : (
                    <span className="text-sm">{cat.icon}</span>
                  )
                })()}
              </div>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Project with inline create */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            {t('form.project')}
          </label>
          <button
            type="button"
            onClick={() => setShowNewProject(!showNewProject)}
            className="text-xs text-brand hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            {t('form.createNew')}
          </button>
        </div>
        {showNewProject ? (
          <div className="flex gap-2 items-center p-2 rounded-lg border border-brand/50 bg-brand/5">
            <ColorPicker
              value={newProjectColor}
              onChange={setNewProjectColor}
              showAll
            />
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={t('form.projectPlaceholder')}
              className="flex-1 h-8 px-2 text-sm rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateProject())}
              autoFocus
            />
            <Button type="button" variant="primary" size="sm" onClick={handleCreateProject}>{t('form.create')}</Button>
            <button type="button" onClick={() => setShowNewProject(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
          />
        )}
      </div>

      {/* Tags with inline create */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium flex items-center gap-1">
            <TagIcon className="w-3.5 h-3.5" />
            {t('form.tags')}
          </label>
          <button
            type="button"
            onClick={() => setShowNewTag(!showNewTag)}
            className="text-xs text-brand hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            {t('form.createNew')}
          </button>
        </div>

        {/* Inline tag creation */}
        {showNewTag && (
          <div className="flex gap-2 items-center p-2 mb-2 rounded-lg border border-brand/50 bg-brand/5">
            <ColorPicker
              value={newTagColor}
              onChange={setNewTagColor}
              showAll
            />
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t('form.tagPlaceholder')}
              className="flex-1 h-8 px-2 text-sm rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
              autoFocus
            />
            <Button type="button" variant="primary" size="sm" onClick={handleCreateTag}>{t('form.create')}</Button>
            <button type="button" onClick={() => setShowNewTag(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-[var(--border-color)] min-h-[44px]">
          {selectedTags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId)
            if (!tag) return null
            return (
              <Tag
                key={tag.id}
                label={tag.name}
                color={tag.color}
                removable
                onRemove={() => toggleTag(tag.id)}
              />
            )
          })}
          <button
            type="button"
            onClick={() => setShowTagPicker(!showTagPicker)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <TagIcon className="w-3 h-3" />
            {t('form.selectTags')}
          </button>
        </div>

        {showTagPicker && tags.length > 0 && (
          <div className="mt-2 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Tag
                  key={tag.id}
                  label={tag.name}
                  color={tag.color}
                  onClick={() => toggleTag(tag.id)}
                  size="md"
                />
              ))}
            </div>
          </div>
        )}
      </div>

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
