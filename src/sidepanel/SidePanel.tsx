import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import i18n, { initI18n } from '@/i18n'
import { ThemeProvider } from '@/stores/theme-context'
import { ToastProvider, useToast } from '@/stores/toast-context'
import { Header, TabBar, FooterTabBar, ModuleTabBar } from '@/components/layout'
import { SearchBar, Modal, DropZone } from '@/components/shared'
import { ItemList, ItemForm, SettingsPanel, BookmarkGroupList, FilterPanel, AnalyticsPanel, AuthorModal } from '@/components/features'
import { PromptsPanel } from '@/components/panels'
import { fetchUrlMetadata } from '@/utils/url-metadata'
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
} from '@/db/operations/item-operations'
import { getAllCategories } from '@/db/operations/category-operations'
import { getAllProjects } from '@/db/operations/project-operations'
import { getAllTags } from '@/db/operations/tag-operations'
// Settings operations no longer needed here - sync config checked in background
import type {
  Item,
  ItemType,
  ItemFormData,
  Category,
  Project,
  Tag,
  FooterTab,
  FilterState,
  ModuleTab,
  AuthorModalTab,
} from '@/types'

function SidePanelContent() {
  const { t } = useTranslation()
  // Module state
  const [activeModule, setActiveModule] = useState<ModuleTab>('items')

  // Tab state - default to 'note' (first tab)
  const [activeTab, setActiveTab] = useState<ItemType>('note')
  const [footerTab, setFooterTab] = useState<FooterTab | null>(null)

  // Data state
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: 'all',
    categoryId: null,
    projectId: null,
    tagIds: [],
  })

  // UI state
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [prefillData, setPrefillData] = useState<{ title?: string; content?: string; url?: string } | null>(null)

  // Author modal state
  const [authorModalOpen, setAuthorModalOpen] = useState(false)
  const [authorModalTab, setAuthorModalTab] = useState<AuthorModalTab>('intro')

  const toast = useToast()

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [itemsData, categoriesData, projectsData, tagsData] = await Promise.all([
        getAllItems(),
        getAllCategories(),
        getAllProjects(),
        getAllTags(),
      ])
      setItems(itemsData)
      setCategories(categoriesData)
      setProjects(projectsData)
      setTags(tagsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Không thể tải dữ liệu')
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // CRUD handlers
  const handleAddItem = () => {
    setEditingItem(null)
    setPrefillData(null)
    setShowForm(true)
  }

  // Handle URL drop - auto-fetch metadata and open form
  const handleUrlDrop = async (url: string) => {
    setIsLoadingUrl(true)
    try {
      const metadata = await fetchUrlMetadata(url)
      setPrefillData({
        title: metadata.title || '',
        content: metadata.description || '',
        url,
      })
      setEditingItem(null)
      setActiveTab('bookmark') // Switch to bookmark tab
      setShowForm(true)
      toast.success('Đã tải thông tin URL')
    } catch (error) {
      console.error('Failed to fetch URL metadata:', error)
      // Still open form with just the URL
      setPrefillData({ url })
      setEditingItem(null)
      setActiveTab('bookmark')
      setShowForm(true)
      toast.warning('Không thể tải thông tin, vui lòng nhập thủ công')
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleSubmitForm = async (data: ItemFormData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          title: data.title,
          content: data.content,
          url: data.url || null,
          priority: data.priority || null,
          deadline: data.deadline || null,
          categoryId: data.categoryId || null,
          projectId: data.projectId || null,
          tags: data.tags,
        } as Partial<Item>)
        toast.success('Đã cập nhật')
      } else {
        await createItem(data)
        toast.success('Đã thêm mới')
      }
      setShowForm(false)
      setEditingItem(null)
      loadData()
    } catch (error) {
      console.error('Failed to save item:', error)
      toast.error('Không thể lưu')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return
    try {
      await deleteItem(id)
      toast.success('Đã xóa')
      loadData()
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Không thể xóa')
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateItem(id, { completed })
      loadData()
    } catch (error) {
      console.error('Failed to toggle complete:', error)
    }
  }

  const handleItemClick = (item: Item) => {
    handleEditItem(item)
  }

  // Sync handler - sends message to background service worker
  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SYNC_NOW' })
      if (response?.success) {
        const { result } = response
        if (result.errors.length > 0) {
          toast.warning(`Đồng bộ hoàn tất với ${result.errors.length} lỗi`)
        } else {
          toast.success('Đồng bộ thành công!')
        }
        loadData() // Reload data after sync
      } else {
        toast.error(response?.error || 'Lỗi đồng bộ')
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Không thể đồng bộ')
    } finally {
      setSyncing(false)
    }
  }

  // Listen for sync messages from background
  useEffect(() => {
    const handleMessage = (message: { type: string; payload?: unknown }) => {
      if (message.type === 'SYNC_COMPLETE') {
        loadData()
        toast.info('Đã đồng bộ dữ liệu mới')
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [loadData, toast])

  // Count tasks
  const taskCount = items.filter((i) => i.type === 'task' && !i.completed).length

  // Handle opening author modal
  const handleOpenAuthorModal = (tab: AuthorModalTab) => {
    setAuthorModalTab(tab)
    setAuthorModalOpen(true)
  }

  // Handle module change
  const handleModuleChange = (module: ModuleTab) => {
    setActiveModule(module)
    setFooterTab(null) // Close footer tab when switching modules
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] relative">
      {/* Animated bubble background */}
      <div className="bubble-background">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
      </div>

      <Header isSyncing={syncing} onSync={handleSync} onOpenAuthorModal={handleOpenAuthorModal} />

      {/* Module switcher at top */}
      <ModuleTabBar activeModule={activeModule} onModuleChange={handleModuleChange} />

      {/* Show Items module */}
      {activeModule === 'items' && footerTab === null && (
        <>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} taskCount={taskCount} />

          {/* Search */}
          <div className="px-3 py-2 border-b border-[var(--border-color)]">
            <SearchBar
              value={filter.search}
              onChange={(search) => setFilter((f) => ({ ...f, search }))}
              placeholder={`Tìm ${activeTab === 'task' ? 'công việc' : activeTab === 'bookmark' ? 'dấu trang' : 'ghi chú'}...`}
            />
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filter={filter}
            categories={categories}
            projects={projects}
            tags={tags}
            activeTab={activeTab}
            onChange={setFilter}
          />
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {footerTab !== null ? (
          // Footer tab content
          <>
            {footerTab === 'analytics' && <AnalyticsPanel />}
            {footerTab === 'logs' && (
              <div className="p-4 text-center text-[var(--text-secondary)]">
                <p className="text-sm">{t('footer.journal')}</p>
                <p className="text-xs mt-2">{t('journal.comingSoon')}</p>
              </div>
            )}
            {footerTab === 'settings' && (
              <SettingsPanel onSyncNow={handleSync} isSyncing={syncing} />
            )}
          </>
        ) : activeModule === 'prompts' ? (
          // Prompts module - sync handled by Header
          <PromptsPanel />
        ) : (
          // Items module
          <DropZone onDrop={handleUrlDrop} isLoading={isLoadingUrl} className="h-full">
            <div className="p-3">
              {activeTab === 'bookmark' ? (
                // Bookmark tab: grouped by category with expand/collapse
                <BookmarkGroupList
                  bookmarks={items.filter((i) => i.type === 'bookmark')}
                  categories={categories}
                  tags={tags}
                  filter={filter}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onClick={handleItemClick}
                />
              ) : (
                // Other tabs: regular list view
                <ItemList
                  items={items}
                  type={activeTab}
                  tags={tags}
                  filter={filter}
                  onAdd={handleAddItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onToggleComplete={handleToggleComplete}
                  onClick={handleItemClick}
                />
              )}
            </div>
          </DropZone>
        )}
      </main>

      {/* FAB - only show on items module main tabs */}
      {footerTab === null && activeModule === 'items' && (
        <div className="absolute bottom-16 right-3 z-10 animate-bounce-in">
          <button
            onClick={handleAddItem}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-brand text-white shadow-lg hover:bg-brand-hover transition-all duration-200 hover:scale-105 active:scale-95"
            title="Thêm mới"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      )}

      <FooterTabBar
        activeTab={footerTab}
        onTabChange={setFooterTab}
        onOpenAuthorModal={handleOpenAuthorModal}
      />

      {/* Item Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setPrefillData(null); }} size="lg">
        <ItemForm
          type={activeTab}
          item={editingItem}
          prefill={prefillData}
          categories={categories}
          projects={projects}
          tags={tags}
          onSubmit={handleSubmitForm}
          onCancel={() => { setShowForm(false); setPrefillData(null); }}
          onMetadataChange={loadData}
        />
      </Modal>

      {/* Author Modal */}
      <AuthorModal
        isOpen={authorModalOpen}
        onClose={() => setAuthorModalOpen(false)}
        defaultTab={authorModalTab}
      />
    </div>
  )
}

export default function SidePanel() {
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    initI18n().then(() => setI18nReady(true))
  }, [])

  if (!i18nReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ToastProvider>
          <SidePanelContent />
        </ToastProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}
