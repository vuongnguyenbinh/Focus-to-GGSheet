import { useState, useEffect } from 'react'
import { Key, Database, RefreshCw, CheckCircle, XCircle, AlertCircle, Plus, X, Tags, FolderOpen, Briefcase, Library, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Select, IconPicker, ColorPicker, CompactColorPicker, TAG_COLORS } from '@/components/shared'
import { getSettings, updateSettings } from '@/db/operations/settings-operations'
import { getAllTags, createTag, deleteTag, updateTag } from '@/db/operations/tag-operations'
import { getAllCategories, createCategory, deleteCategory, updateCategory } from '@/db/operations/category-operations'
import { getAllProjects, createProject, deleteProject, updateProject } from '@/db/operations/project-operations'
import { notionClient } from '@/services/notion'
import { promptSyncService } from '@/services/notion/prompt-sync-service'
import { useToast } from '@/stores/toast-context'
import type { Settings, Tag as TagType, Category, Project } from '@/types'

interface SettingsPanelProps {
  onSyncNow?: () => void
  isSyncing?: boolean
}

export function SettingsPanel({ onSyncNow, isSyncing }: SettingsPanelProps) {
  const { t, i18n } = useTranslation()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [notionToken, setNotionToken] = useState('')
  const [notionDatabaseId, setNotionDatabaseId] = useState('')
  const [promptsDatabaseId, setPromptsDatabaseId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')
  const [promptsConnectionStatus, setPromptsConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

  // Auto-sync state
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [autoSyncInterval, setAutoSyncInterval] = useState(5)

  // Tags state
  const [tags, setTags] = useState<TagType[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder')

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState(TAG_COLORS[4].value)

  const toast = useToast()

  useEffect(() => {
    loadSettings()
    loadMetadata()
  }, [])

  const loadSettings = async () => {
    const s = await getSettings()
    setSettings(s)
    setNotionToken(s.notionToken || '')
    setNotionDatabaseId(s.notionDatabaseId || '')
    setPromptsDatabaseId(s.promptsDatabaseId || '')
    setAutoSyncEnabled(s.autoSyncEnabled ?? true)
    setAutoSyncInterval(s.autoSyncInterval ?? 5)
    if (s.notionToken && s.notionDatabaseId) {
      setConnectionStatus('connected')
    }
    if (s.notionToken && s.promptsDatabaseId) {
      setPromptsConnectionStatus('connected')
    }
  }

  const loadMetadata = async () => {
    const [tagsData, categoriesData, projectsData] = await Promise.all([
      getAllTags(),
      getAllCategories(),
      getAllProjects(),
    ])
    setTags(tagsData)
    setCategories(categoriesData)
    setProjects(projectsData)
  }

  // Tag handlers
  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    try {
      await createTag({ name: newTagName.trim(), color: newTagColor })
      setNewTagName('')
      setNewTagColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value)
      loadMetadata()
      toast.success(t('toast.saved'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleUpdateTagColor = async (id: string, color: string) => {
    try {
      await updateTag(id, { color })
      loadMetadata()
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id)
      loadMetadata()
      toast.success(t('toast.deleted'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  // Category handlers
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategory({ name: newCategoryName.trim(), icon: newCategoryIcon, parentId: null })
      setNewCategoryName('')
      setNewCategoryIcon('folder')
      loadMetadata()
      toast.success(t('toast.saved'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleUpdateCategoryIcon = async (id: string, icon: string) => {
    try {
      await updateCategory(id, { icon })
      loadMetadata()
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      loadMetadata()
      toast.success(t('toast.deleted'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  // Project handlers
  const handleAddProject = async () => {
    if (!newProjectName.trim()) return
    try {
      await createProject({ name: newProjectName.trim(), color: newProjectColor })
      setNewProjectName('')
      setNewProjectColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value)
      loadMetadata()
      toast.success(t('toast.saved'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleUpdateProjectColor = async (id: string, color: string) => {
    try {
      await updateProject(id, { color })
      loadMetadata()
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id)
      loadMetadata()
      toast.success(t('toast.deleted'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings({
        notionToken: notionToken.trim() || null,
        notionDatabaseId: notionDatabaseId.trim() || null,
        promptsDatabaseId: promptsDatabaseId.trim() || null,
      })
      toast.success(t('toast.saved'))
      setConnectionStatus(notionToken && notionDatabaseId ? 'connected' : 'unknown')
      setPromptsConnectionStatus(notionToken && promptsDatabaseId ? 'connected' : 'unknown')
    } catch {
      toast.error(t('toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async () => {
    if (!notionToken || !notionDatabaseId) {
      toast.warning(t('settings.fillRequired'))
      return
    }

    // Save first so the API client can read credentials
    await updateSettings({
      notionToken: notionToken.trim(),
      notionDatabaseId: notionDatabaseId.trim(),
    })

    toast.info(t('settings.testingConnection'))

    try {
      const connected = await notionClient.testConnection()
      if (connected) {
        setConnectionStatus('connected')
        toast.success(t('settings.connectionSuccess'))
      } else {
        setConnectionStatus('error')
        toast.error(t('settings.connectionFailed'))
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error(t('settings.connectionError', { error: error instanceof Error ? error.message : 'Unknown' }))
    }
  }

  const testPromptsConnection = async () => {
    if (!notionToken || !promptsDatabaseId) {
      toast.warning(t('settings.fillPromptsRequired'))
      return
    }

    // Save first
    await updateSettings({
      notionToken: notionToken.trim(),
      promptsDatabaseId: promptsDatabaseId.trim(),
    })

    toast.info(t('settings.testingPromptsConnection'))

    try {
      const connected = await promptSyncService.testConnection()
      if (connected) {
        setPromptsConnectionStatus('connected')
        toast.success(t('settings.promptsConnectionSuccess'))
      } else {
        setPromptsConnectionStatus('error')
        toast.error(t('settings.promptsConnectionFailed'))
      }
    } catch (error) {
      setPromptsConnectionStatus('error')
      toast.error(t('settings.connectionError', { error: error instanceof Error ? error.message : 'Unknown' }))
    }
  }

  const formatLastSync = () => {
    if (!settings?.lastSyncAt) return t('settings.notSynced')
    const date = new Date(settings.lastSyncAt)
    return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }

  const formatPromptsLastSync = () => {
    if (!settings?.promptsLastSyncAt) return t('settings.notSynced')
    const date = new Date(settings.promptsLastSyncAt)
    return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }

  // Auto-sync handlers
  const handleToggleAutoSync = async () => {
    const newValue = !autoSyncEnabled
    setAutoSyncEnabled(newValue)
    await updateSettings({ autoSyncEnabled: newValue })
    // Notify background to update alarm
    chrome.runtime.sendMessage({ type: 'UPDATE_AUTO_SYNC' }).catch(() => {})
    toast.success(newValue ? t('settings.autoSyncEnabled') : t('settings.autoSyncDisabled'))
  }

  const handleIntervalChange = async (value: string) => {
    const interval = parseInt(value, 10)
    setAutoSyncInterval(interval)
    await updateSettings({ autoSyncInterval: interval })
    // Notify background to update alarm
    chrome.runtime.sendMessage({ type: 'UPDATE_AUTO_SYNC' }).catch(() => {})
    toast.success(t('settings.syncIntervalUpdated', { interval }))
  }

  const syncIntervalOptions = [
    { value: '1', label: t('settings.interval1min') },
    { value: '5', label: t('settings.interval5min') },
    { value: '10', label: t('settings.interval10min') },
    { value: '15', label: t('settings.interval15min') },
    { value: '30', label: t('settings.interval30min') },
    { value: '60', label: t('settings.interval1hour') },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Notion Integration */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          {t('settings.notionConnection')}
        </h3>

        <div className="space-y-3">
          <Input
            label="Integration Token"
            type="password"
            value={notionToken}
            onChange={(e) => setNotionToken(e.target.value)}
            placeholder="secret_..."
            icon={<Key className="w-4 h-4" />}
          />

          <Input
            label="Items Database ID"
            value={notionDatabaseId}
            onChange={(e) => setNotionDatabaseId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            icon={<Database className="w-4 h-4" />}
          />

          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-success">{t('settings.connected')}</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="w-4 h-4 text-error" />
                <span className="text-error">{t('settings.connectionError')}</span>
              </>
            )}
            {connectionStatus === 'unknown' && (
              <>
                <AlertCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-[var(--text-secondary)]">{t('settings.notConfigured')}</span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={testConnection}
              disabled={!notionToken || !notionDatabaseId}
            >
              {t('settings.test')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
            >
              {t('settings.save')}
            </Button>
          </div>
        </div>
      </section>

      {/* Prompts Database */}
      <section className="pt-4 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Library className="w-4 h-4" />
          {t('settings.promptsConnection')}
        </h3>

        <div className="space-y-3">
          <Input
            label="Prompts Database ID"
            value={promptsDatabaseId}
            onChange={(e) => setPromptsDatabaseId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            icon={<Database className="w-4 h-4" />}
          />

          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {promptsConnectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-success">{t('settings.connected')}</span>
              </>
            )}
            {promptsConnectionStatus === 'error' && (
              <>
                <XCircle className="w-4 h-4 text-error" />
                <span className="text-error">{t('settings.connectionError')}</span>
              </>
            )}
            {promptsConnectionStatus === 'unknown' && (
              <>
                <AlertCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-[var(--text-secondary)]">{t('settings.notConfigured')}</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{t('settings.lastSync')}:</span>
            <span>{formatPromptsLastSync()}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={testPromptsConnection}
            disabled={!notionToken || !promptsDatabaseId}
          >
            {t('settings.testPrompts')}
          </Button>
        </div>
      </section>

      {/* Sync Status */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('settings.sync')}
        </h3>

        <div className="space-y-3">
          {/* Auto-sync toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm">{t('settings.autoSync')}</span>
            </div>
            <button
              onClick={handleToggleAutoSync}
              className={`p-1 rounded-lg transition-colors ${
                autoSyncEnabled ? 'text-brand' : 'text-[var(--text-secondary)]'
              }`}
            >
              {autoSyncEnabled ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Interval selector */}
          {autoSyncEnabled && (
            <Select
              label={t('settings.syncInterval')}
              value={autoSyncInterval.toString()}
              onChange={(e) => handleIntervalChange(e.target.value)}
              options={syncIntervalOptions}
            />
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{t('settings.lastSync')}:</span>
            <span>{formatLastSync()}</span>
          </div>

          <Button
            variant="secondary"
            fullWidth
            icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
            onClick={onSyncNow}
            loading={isSyncing}
            disabled={connectionStatus !== 'connected'}
          >
            {isSyncing ? t('settings.syncing') : t('settings.syncNow')}
          </Button>
        </div>
      </section>

      {/* Tags Management */}
      <section className="pt-4 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Tags className="w-4 h-4" />
          {t('settings.manageTags')}
        </h3>

        {/* Existing tags with inline editing */}
        <div className="space-y-1.5 mb-3">
          {tags.length === 0 ? (
            <span className="text-xs text-[var(--text-secondary)]">{t('settings.noTags')}</span>
          ) : (
            tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2">
                  <CompactColorPicker
                    value={tag.color}
                    onChange={(color) => handleUpdateTagColor(tag.id, color)}
                  />
                  <span className="text-sm">{tag.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new tag */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t('settings.newTagPlaceholder')}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
          </div>
          <ColorPicker value={newTagColor} onChange={setNewTagColor} showAll />
          <Button variant="primary" size="sm" icon={<Plus className="w-3 h-3" />} onClick={handleAddTag}>
            {t('settings.add')}
          </Button>
        </div>
      </section>

      {/* Categories Management */}
      <section className="pt-4 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          {t('settings.manageCategories')}
        </h3>

        {/* Existing categories with icon editing */}
        <div className="space-y-1.5 mb-3">
          {categories.length === 0 ? (
            <span className="text-xs text-[var(--text-secondary)]">{t('settings.noCategories')}</span>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2">
                  <IconPicker
                    value={cat.icon}
                    onChange={(icon) => handleUpdateCategoryIcon(cat.id, icon)}
                    size="sm"
                  />
                  <span className="text-sm">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new category */}
        <div className="flex gap-2 items-end">
          <IconPicker value={newCategoryIcon} onChange={setNewCategoryIcon} />
          <div className="flex-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('settings.newCategoryPlaceholder')}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3 h-3" />} onClick={handleAddCategory}>
            {t('settings.add')}
          </Button>
        </div>
      </section>

      {/* Projects Management */}
      <section className="pt-4 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          {t('settings.manageProjects')}
        </h3>

        {/* Existing projects with color editing */}
        <div className="space-y-1.5 mb-3">
          {projects.length === 0 ? (
            <span className="text-xs text-[var(--text-secondary)]">{t('settings.noProjects')}</span>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2">
                  <CompactColorPicker
                    value={proj.color}
                    onChange={(color) => handleUpdateProjectColor(proj.id, color)}
                  />
                  <span className="text-sm">{proj.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteProject(proj.id)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new project */}
        <div className="flex gap-2 items-end">
          <ColorPicker value={newProjectColor} onChange={setNewProjectColor} showAll />
          <div className="flex-1">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={t('settings.newProjectPlaceholder')}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            />
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3 h-3" />} onClick={handleAddProject}>
            {t('settings.add')}
          </Button>
        </div>
      </section>

      {/* Help */}
      <section className="pt-4 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-2">{t('settings.guide')}</h3>
        <ol className="text-xs text-[var(--text-secondary)] space-y-1.5 list-decimal list-inside">
          <li>{t('settings.guideStep1')}</li>
          <li>{t('settings.guideStep2')}</li>
          <li>{t('settings.guideStep3')}</li>
          <li>{t('settings.guideStep4')}</li>
        </ol>
      </section>
    </div>
  )
}
