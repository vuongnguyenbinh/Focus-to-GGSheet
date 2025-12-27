/**
 * Sync service for bidirectional Google Sheets synchronization
 * Handles queue processing, conflict resolution (LWW), and batch operations
 *
 * Key design: Local uses IDs, Sheets use Names
 * - Push to Sheets: Convert IDs → Names
 * - Pull from Sheets: Convert Names → IDs (create if not exists)
 */

import { db } from '@/db/schema'
import { sheetsClient } from './api-client'
import { itemToSheetRow, sheetRowToItem, type MetadataLookup, type ParsedSheetItem } from './data-transformer'
import { promptToSheetRow, sheetRowToPrompt, type ParsedSheetPrompt } from './prompt-transformer'
import { updateSettings, getSettings } from '@/db/operations/settings-operations'
import { getAllTags, createTag } from '@/db/operations/tag-operations'
import { getAllCategories, createCategory } from '@/db/operations/category-operations'
import { getAllProjects, createProject } from '@/db/operations/project-operations'
import { getFaviconUrl } from '@/utils/favicon'
import type { Item, Prompt, SyncQueue, PromptSyncQueue, SyncStatus, Tag, Category, Project } from '@/types'

// Default colors for auto-created metadata
const DEFAULT_TAG_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']
const DEFAULT_PROJECT_COLORS = ['#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1']

export type SyncResult = {
  success: boolean
  created: number
  updated: number
  deleted: number
  errors: string[]
}

class SheetsSyncService {
  private isSyncing = false

  /**
   * Check if sync is currently in progress
   */
  get syncing(): boolean {
    return this.isSyncing
  }

  /**
   * Load all metadata for ID ↔ Name conversion
   */
  private async loadMetadata(): Promise<MetadataLookup> {
    const [tags, categories, projects] = await Promise.all([
      getAllTags(),
      getAllCategories(),
      getAllProjects(),
    ])
    return { tags, categories, projects }
  }

  /**
   * Resolve tag names to IDs, creating tags if they don't exist
   */
  private async resolveTagNames(tagNames: string[], existingTags: Tag[]): Promise<string[]> {
    const tagIds: string[] = []

    for (const name of tagNames) {
      let tag = existingTags.find(t => t.name.toLowerCase() === name.toLowerCase())
      if (!tag) {
        const color = DEFAULT_TAG_COLORS[tagIds.length % DEFAULT_TAG_COLORS.length]
        tag = await createTag({ name, color })
        existingTags.push(tag) // Add to cache for subsequent lookups
      }
      tagIds.push(tag.id)
    }

    return tagIds
  }

  /**
   * Resolve category name to ID, creating if doesn't exist
   */
  private async resolveCategoryName(categoryName: string | null, existingCategories: Category[]): Promise<string | null> {
    if (!categoryName) return null

    let category = existingCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
    if (!category) {
      category = await createCategory({ name: categoryName, icon: 'folder', parentId: null })
      existingCategories.push(category)
    }
    return category.id
  }

  /**
   * Resolve project name to ID, creating if doesn't exist
   */
  private async resolveProjectName(projectName: string | null, existingProjects: Project[]): Promise<string | null> {
    if (!projectName) return null

    let project = existingProjects.find(p => p.name.toLowerCase() === projectName.toLowerCase())
    if (!project) {
      const color = DEFAULT_PROJECT_COLORS[existingProjects.length % DEFAULT_PROJECT_COLORS.length]
      project = await createProject({ name: projectName, color })
      existingProjects.push(project)
    }
    return project.id
  }

  // ========================================
  // ITEMS SYNC
  // ========================================

  /**
   * Process all pending items in the sync queue (push to Sheets)
   */
  async processItemsQueue(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, created: 0, updated: 0, deleted: 0, errors: ['Sync already in progress'] }
    }

    this.isSyncing = true
    const result: SyncResult = { success: true, created: 0, updated: 0, deleted: 0, errors: [] }

    try {
      // Check if Sheets is configured
      const settings = await getSettings()
      if (!settings.sheetsDeploymentUrl || !settings.sheetsSecret) {
        console.log('[SheetsSync] Not configured, skipping queue processing')
        return { success: true, created: 0, updated: 0, deleted: 0, errors: [] }
      }

      const metadata = await this.loadMetadata()
      const pending = await db.syncQueue.where('status').equals('queued').sortBy('timestamp')

      console.log(`[SheetsSync] Processing ${pending.length} queued items`)

      for (const queueItem of pending) {
        try {
          await this.processItemQueueEntry(queueItem, result, metadata)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push(`${queueItem.operation} ${queueItem.itemId}: ${errorMsg}`)
          console.error(`[SheetsSync] Error processing item:`, error)

          const retries = (queueItem.retries || 0) + 1
          if (retries >= 3) {
            await db.syncQueue.update(queueItem.id!, { status: 'failed', retries })
          } else {
            await db.syncQueue.update(queueItem.id!, { retries })
          }
        }
      }

      await updateSettings({ lastSyncAt: Date.now() })
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      this.isSyncing = false
    }

    return result
  }

  /**
   * Process a single item queue entry
   */
  private async processItemQueueEntry(queueItem: SyncQueue, result: SyncResult, metadata: MetadataLookup): Promise<void> {
    await db.syncQueue.update(queueItem.id!, { status: 'syncing' })

    const item = await db.items.get(queueItem.itemId)

    switch (queueItem.operation) {
      case 'create':
      case 'update': {
        if (!item) {
          // Item was deleted locally, skip
          await db.syncQueue.delete(queueItem.id!)
          return
        }

        const rowData = itemToSheetRow(item, metadata)
        console.log(`[SheetsSync] ${queueItem.operation} item:`, item.id, item.title)
        console.log('[SheetsSync] Row data:', JSON.stringify(rowData))

        if (queueItem.operation === 'create') {
          const createResult = await sheetsClient.createItem(rowData)
          console.log('[SheetsSync] Create result:', JSON.stringify(createResult))
          result.created++
        } else {
          const updateResult = await sheetsClient.updateItem(rowData)
          console.log('[SheetsSync] Update result:', JSON.stringify(updateResult))
          result.updated++
        }

        await db.items.update(item.id, { syncStatus: 'synced' as SyncStatus })
        break
      }

      case 'delete': {
        const itemId = queueItem.itemId
        await sheetsClient.deleteItem(itemId)
        result.deleted++
        break
      }
    }

    await db.syncQueue.delete(queueItem.id!)
  }

  /**
   * Pull items from Sheets and merge with local data
   * @param forceFullSync If true, fetches all items regardless of lastSyncAt
   */
  async pullItems(forceFullSync = false): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, created: 0, updated: 0, deleted: 0, errors: ['Sync already in progress'] }
    }

    this.isSyncing = true
    const result: SyncResult = { success: true, created: 0, updated: 0, deleted: 0, errors: [] }

    try {
      const settings = await getSettings()
      if (!settings.sheetsDeploymentUrl || !settings.sheetsSecret) {
        console.log('[SheetsSync] Not configured, skipping pull')
        this.isSyncing = false
        return { success: true, created: 0, updated: 0, deleted: 0, errors: [] }
      }

      const metadata = await this.loadMetadata()
      const lastSyncAt = forceFullSync ? null : settings.lastSyncAt

      const sheetRows = lastSyncAt
        ? await sheetsClient.getModifiedItemsSince(lastSyncAt)
        : await sheetsClient.getAllItems()

      console.log(`[SheetsSync] ${lastSyncAt ? 'Delta' : 'Full'} sync: fetched ${sheetRows.length} items`)

      const localItems = await db.items.toArray()
      const localById = new Map<string, Item>(localItems.map(i => [i.id, i]))

      for (const row of sheetRows) {
        const parsed: ParsedSheetItem = sheetRowToItem(row)

        // Skip invalid rows
        if (!parsed.id) continue

        const localItem = localById.get(parsed.id)

        // Resolve names to IDs
        const tagIds = await this.resolveTagNames(parsed.tagNames, metadata.tags)
        const categoryId = await this.resolveCategoryName(parsed.categoryName, metadata.categories)
        const projectId = await this.resolveProjectName(parsed.projectName, metadata.projects)

        // Generate favicon for bookmarks
        const faviconUrl = parsed.type === 'bookmark' && parsed.url
          ? getFaviconUrl(parsed.url)
          : null

        if (localItem) {
          // Existing item - check for conflict (LWW)
          const sheetTime = parsed.updatedAt.getTime()
          const localTime = localItem.updatedAt.getTime()

          if (sheetTime > localTime) {
            // Sheets wins - update local
            await db.items.update(localItem.id, {
              type: parsed.type,
              title: parsed.title,
              content: parsed.content,
              url: parsed.url,
              faviconUrl: faviconUrl || localItem.faviconUrl,
              priority: parsed.priority,
              deadline: parsed.deadline,
              completed: parsed.completed,
              tags: tagIds,
              categoryId,
              projectId,
              syncStatus: 'synced' as SyncStatus,
              updatedAt: parsed.updatedAt,
            })
            result.updated++
          }
          // If local wins, it will be pushed in processQueue
        } else {
          // New item from Sheets - create locally
          const newItem: Item = {
            id: parsed.id,
            type: parsed.type || 'note',
            title: parsed.title || '',
            content: parsed.content || '',
            url: parsed.url || null,
            faviconUrl,
            priority: parsed.priority || null,
            deadline: parsed.deadline || null,
            completed: parsed.completed || false,
            categoryId,
            projectId,
            tags: tagIds,
            createdAt: new Date(),
            updatedAt: parsed.updatedAt || new Date(),
            notionId: null, // Legacy field
            syncStatus: 'synced',
          }

          await db.items.add(newItem)
          result.created++
        }
      }

      await updateSettings({ lastSyncAt: Date.now() })
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      this.isSyncing = false
    }

    return result
  }

  // ========================================
  // PROMPTS SYNC
  // ========================================

  /**
   * Process prompts sync queue (push to Sheets)
   */
  async processPromptsQueue(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, created: 0, updated: 0, deleted: 0, errors: ['Sync already in progress'] }
    }

    this.isSyncing = true
    const result: SyncResult = { success: true, created: 0, updated: 0, deleted: 0, errors: [] }

    try {
      const settings = await getSettings()
      if (!settings.sheetsDeploymentUrl || !settings.sheetsSecret) {
        console.log('[SheetsSync] Not configured, skipping prompts queue')
        return { success: true, created: 0, updated: 0, deleted: 0, errors: [] }
      }

      const pending = await db.promptSyncQueue.where('status').equals('queued').sortBy('timestamp')

      console.log(`[SheetsSync] Processing ${pending.length} queued prompts`)

      for (const queueItem of pending) {
        try {
          await this.processPromptQueueEntry(queueItem, result)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push(`${queueItem.operation} ${queueItem.promptId}: ${errorMsg}`)
          console.error(`[SheetsSync] Error processing prompt:`, error)

          const retries = (queueItem.retries || 0) + 1
          if (retries >= 3) {
            await db.promptSyncQueue.update(queueItem.id!, { status: 'failed', retries })
          } else {
            await db.promptSyncQueue.update(queueItem.id!, { retries })
          }
        }
      }

      await updateSettings({ promptsLastSyncAt: Date.now() })
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      this.isSyncing = false
    }

    return result
  }

  /**
   * Process a single prompt queue entry
   */
  private async processPromptQueueEntry(queueItem: PromptSyncQueue, result: SyncResult): Promise<void> {
    await db.promptSyncQueue.update(queueItem.id!, { status: 'syncing' })

    const prompt = await db.prompts.get(queueItem.promptId)

    switch (queueItem.operation) {
      case 'create':
      case 'update': {
        if (!prompt) {
          await db.promptSyncQueue.delete(queueItem.id!)
          return
        }

        const rowData = promptToSheetRow(prompt)

        if (queueItem.operation === 'create') {
          await sheetsClient.createPrompt(rowData)
          result.created++
        } else {
          await sheetsClient.updatePrompt(rowData)
          result.updated++
        }

        await db.prompts.update(prompt.id, { syncStatus: 'synced' as SyncStatus })
        break
      }

      case 'delete': {
        await sheetsClient.deletePrompt(queueItem.promptId)
        result.deleted++
        break
      }
    }

    await db.promptSyncQueue.delete(queueItem.id!)
  }

  /**
   * Pull prompts from Sheets
   */
  async pullPrompts(forceFullSync = false): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, created: 0, updated: 0, deleted: 0, errors: ['Sync already in progress'] }
    }

    this.isSyncing = true
    const result: SyncResult = { success: true, created: 0, updated: 0, deleted: 0, errors: [] }

    try {
      const settings = await getSettings()
      if (!settings.sheetsDeploymentUrl || !settings.sheetsSecret) {
        console.log('[SheetsSync] Not configured, skipping prompts pull')
        this.isSyncing = false
        return { success: true, created: 0, updated: 0, deleted: 0, errors: [] }
      }

      const lastSyncAt = forceFullSync ? null : settings.promptsLastSyncAt

      const sheetRows = lastSyncAt
        ? await sheetsClient.getModifiedPromptsSince(lastSyncAt)
        : await sheetsClient.getAllPrompts()

      console.log(`[SheetsSync] ${lastSyncAt ? 'Delta' : 'Full'} prompts sync: ${sheetRows.length}`)

      const localPrompts = await db.prompts.toArray()
      const localById = new Map<string, Prompt>(localPrompts.map(p => [p.id, p]))

      for (const row of sheetRows) {
        const parsed: ParsedSheetPrompt = sheetRowToPrompt(row)

        if (!parsed.id) continue

        const localPrompt = localById.get(parsed.id)

        if (localPrompt) {
          // LWW conflict resolution
          if (parsed.updatedAt.getTime() > localPrompt.updatedAt.getTime()) {
            await db.prompts.update(localPrompt.id, {
              title: parsed.title,
              description: parsed.description,
              prompt: parsed.prompt,
              type: parsed.type,
              category: parsed.category,
              tags: parsed.tags,
              note: parsed.note,
              approved: parsed.approved,
              favorite: parsed.favorite,
              quality: parsed.quality,
              textDemo: parsed.textDemo,
              urlDemo: parsed.urlDemo,
              syncStatus: 'synced' as SyncStatus,
              updatedAt: parsed.updatedAt,
            })
            result.updated++
          }
        } else {
          // New prompt from Sheets
          const newPrompt: Prompt = {
            id: parsed.id,
            title: parsed.title,
            description: parsed.description,
            prompt: parsed.prompt,
            type: parsed.type,
            category: parsed.category,
            tags: parsed.tags,
            note: parsed.note,
            approved: parsed.approved,
            favorite: parsed.favorite,
            quality: parsed.quality,
            textDemo: parsed.textDemo,
            fileDemo: null, // Not supported in Sheets sync
            urlDemo: parsed.urlDemo,
            createdAt: new Date(),
            updatedAt: parsed.updatedAt,
            notionId: null,
            syncStatus: 'synced',
          }

          await db.prompts.add(newPrompt)
          result.created++
        }
      }

      await updateSettings({ promptsLastSyncAt: Date.now() })
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      this.isSyncing = false
    }

    return result
  }

  // ========================================
  // COMBINED SYNC
  // ========================================

  /**
   * Full sync: pull from Sheets, then push local changes
   * @param forceFullSync If true, forces a complete re-sync
   */
  async fullSync(forceFullSync = false): Promise<SyncResult> {
    // Pull items first
    const pullItemsResult = await this.pullItems(forceFullSync)
    if (!pullItemsResult.success) {
      return pullItemsResult
    }

    // Push items
    const pushItemsResult = await this.processItemsQueue()

    // Pull prompts
    const pullPromptsResult = await this.pullPrompts(forceFullSync)

    // Push prompts
    const pushPromptsResult = await this.processPromptsQueue()

    return {
      success: pullItemsResult.success && pushItemsResult.success &&
               pullPromptsResult.success && pushPromptsResult.success,
      created: pullItemsResult.created + pushItemsResult.created +
               pullPromptsResult.created + pushPromptsResult.created,
      updated: pullItemsResult.updated + pushItemsResult.updated +
               pullPromptsResult.updated + pushPromptsResult.updated,
      deleted: pullItemsResult.deleted + pushItemsResult.deleted +
               pullPromptsResult.deleted + pushPromptsResult.deleted,
      errors: [
        ...pullItemsResult.errors, ...pushItemsResult.errors,
        ...pullPromptsResult.errors, ...pushPromptsResult.errors,
      ],
    }
  }

  /**
   * Force a complete re-sync
   */
  async forceFullSync(): Promise<SyncResult> {
    return this.fullSync(true)
  }

  /**
   * Get sync queue status (combined items + prompts)
   */
  async getQueueStatus(): Promise<{
    queued: number
    syncing: number
    failed: number
  }> {
    const itemsQueue = await db.syncQueue.toArray()
    const promptsQueue = await db.promptSyncQueue.toArray()
    const all = [...itemsQueue, ...promptsQueue]

    return {
      queued: all.filter(q => q.status === 'queued').length,
      syncing: all.filter(q => q.status === 'syncing').length,
      failed: all.filter(q => q.status === 'failed').length,
    }
  }

  /**
   * Retry failed items
   */
  async retryFailed(): Promise<number> {
    const failedItems = await db.syncQueue.where('status').equals('failed').toArray()
    const failedPrompts = await db.promptSyncQueue.where('status').equals('failed').toArray()

    for (const item of failedItems) {
      await db.syncQueue.update(item.id!, { status: 'queued', retries: 0 })
    }
    for (const prompt of failedPrompts) {
      await db.promptSyncQueue.update(prompt.id!, { status: 'queued', retries: 0 })
    }

    return failedItems.length + failedPrompts.length
  }

  /**
   * Clear failed items from queue
   */
  async clearFailed(): Promise<number> {
    const failedItems = await db.syncQueue.where('status').equals('failed').toArray()
    const failedPrompts = await db.promptSyncQueue.where('status').equals('failed').toArray()

    for (const item of failedItems) {
      await db.syncQueue.delete(item.id!)
    }
    for (const prompt of failedPrompts) {
      await db.promptSyncQueue.delete(prompt.id!)
    }

    return failedItems.length + failedPrompts.length
  }
}

// Singleton instance
export const sheetsSyncService = new SheetsSyncService()
