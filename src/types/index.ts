// Item types (polymorphic)
export type ItemType = 'task' | 'bookmark' | 'note'
export type Priority = 'high' | 'medium' | 'low'
export type SyncStatus = 'pending' | 'synced' | 'error'
export type QueueStatus = 'queued' | 'syncing' | 'failed'
export type Operation = 'create' | 'update' | 'delete'

// Prompt types
export type PromptType = 'text' | 'image' | 'video'
export type QualityRating = 1 | 2 | 3 | 4 | 5

export interface Item {
  id: string
  type: ItemType
  title: string
  content: string
  url: string | null
  faviconUrl: string | null
  priority: Priority | null
  deadline: Date | null
  completed: boolean
  categoryId: string | null
  projectId: string | null
  tags: string[] // Tag IDs
  createdAt: Date
  updatedAt: Date
  notionId: string | null
  syncStatus: SyncStatus
}

export interface Category {
  id: string
  name: string
  icon: string
  parentId: string | null
  order: number
  notionId: string | null
}

export interface Project {
  id: string
  name: string
  color: string
  notionId: string | null
}

export interface Tag {
  id: string
  name: string
  color: string
  notionId: string | null
}

export interface SyncQueue {
  id?: number
  itemId: string
  operation: Operation
  payload: Partial<Item> | null
  timestamp: number
  retries: number
  status: QueueStatus
}

// Prompt Library
export interface Prompt {
  id: string
  title: string
  description: string
  prompt: string              // Main copyable content
  type: PromptType
  category: string | null     // Category name (stored as name, not ID)
  tags: string[]              // Tag names (stored as names)
  note: string
  approved: boolean
  favorite: boolean
  quality: QualityRating | null
  textDemo: string | null
  fileDemo: string | null     // URL from Notion files
  urlDemo: string | null
  createdAt: Date
  updatedAt: Date
  notionId: string | null
  syncStatus: SyncStatus
}

export interface PromptSyncQueue {
  id?: number
  promptId: string
  operation: Operation
  payload: Partial<Prompt> | null
  timestamp: number
  retries: number
  status: QueueStatus
}

export interface Settings {
  id: string
  theme: 'light' | 'dark'
  // Notion settings (deprecated, will be removed)
  notionToken: string | null
  notionDatabaseId: string | null
  promptsDatabaseId: string | null
  // Google Sheets settings
  sheetsDeploymentUrl: string | null
  sheetsSecret: string | null
  // Sync timestamps
  lastSyncAt: number | null
  promptsLastSyncAt: number | null
  // Auto-sync settings
  autoSyncEnabled: boolean
  autoSyncInterval: number // minutes
}

// Form types
export interface ItemFormData {
  type: ItemType
  title: string
  content: string
  url?: string
  priority?: Priority
  deadline?: Date
  categoryId?: string
  projectId?: string
  tags: string[]
}

export interface CategoryFormData {
  name: string
  icon: string
  parentId: string | null
}

export interface ProjectFormData {
  name: string
  color: string
}

export interface TagFormData {
  name: string
  color: string
}

// Prompt form data
export interface PromptFormData {
  title: string
  description: string
  prompt: string
  type: PromptType
  category: string | null
  tags: string[]
  note: string
  approved: boolean
  favorite: boolean
  quality: QualityRating | null
  textDemo: string | null
  fileDemo: string | null
  urlDemo: string | null
}

// UI State types
export type MainTab = 'tasks' | 'bookmarks' | 'notes'
export type FooterTab = 'analytics' | 'logs' | 'settings'
export type ModuleTab = 'items' | 'prompts'
export type Theme = 'light' | 'dark'
export type AuthorModalTab = 'intro' | 'coffee' | 'request'

export interface FilterState {
  search: string
  status: 'all' | 'pending' | 'completed'
  categoryId: string | null
  projectId: string | null
  tagIds: string[]
}

export interface PromptFilterState {
  category: string | null
  tags: string[]
  approved: boolean | null
  favorite: boolean | null
}

// Item filter for queries
export interface ItemFilter {
  type?: ItemType
  categoryId?: string
  projectId?: string
  tags?: string[]
  completed?: boolean
  search?: string
}

// Feature request webhook payload
export interface FeatureRequestPayload {
  name: string
  email: string
  phone?: string
  message: string
  source: 'GGSheet Extension'
  timestamp: string
}
