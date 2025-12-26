/**
 * Transform between local Item format and Google Sheet row format
 * Handles ID ↔ Name conversion for tags, categories, projects
 */

import type { Item, ItemType, Priority, Tag, Category, Project } from '@/types'
import type { SheetRow } from './api-client'

/**
 * Metadata lookup for ID ↔ Name conversion
 */
export interface MetadataLookup {
  tags: Tag[]
  categories: Category[]
  projects: Project[]
}

/**
 * Convert local Item to Sheet row format
 * - Tag IDs → comma-separated names
 * - Category ID → name
 * - Project ID → name
 */
export function itemToSheetRow(item: Item, metadata?: MetadataLookup): SheetRow {
  // Convert tag IDs to comma-separated names
  let tagNames = ''
  if (item.tags.length > 0 && metadata) {
    tagNames = item.tags
      .map(id => metadata.tags.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(',')
  }

  // Convert category ID to name
  let categoryName = ''
  if (item.categoryId && metadata) {
    categoryName = metadata.categories.find(c => c.id === item.categoryId)?.name || ''
  }

  // Convert project ID to name
  let projectName = ''
  if (item.projectId && metadata) {
    projectName = metadata.projects.find(p => p.id === item.projectId)?.name || ''
  }

  return {
    ID: item.id,
    Type: item.type,
    Title: item.title,
    Content: item.content || '',
    URL: item.url || '',
    Priority: item.priority || '',
    Deadline: item.deadline ? item.deadline.toISOString().split('T')[0] : '',
    Completed: item.completed ? 'TRUE' : 'FALSE',
    Tags: tagNames,
    Category: categoryName,
    Project: projectName,
    UpdatedAt: item.updatedAt.toISOString(),
  }
}

/**
 * Parsed Sheet item - intermediate format before ID resolution
 */
export interface ParsedSheetItem {
  id: string
  type: ItemType
  title: string
  content: string
  url: string | null
  priority: Priority | null
  deadline: Date | null
  completed: boolean
  tagNames: string[]       // Names, need to convert to IDs
  categoryName: string | null
  projectName: string | null
  updatedAt: Date
  rowIndex?: number
}

/**
 * Parse Sheet row to intermediate format
 * Names need to be resolved to IDs by sync service
 */
export function sheetRowToItem(row: SheetRow): ParsedSheetItem {
  // Parse deadline - handle both YYYY-MM-DD and full ISO format
  let deadline: Date | null = null
  if (row.Deadline) {
    const dateStr = String(row.Deadline)
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      deadline = parsed
    }
  }

  // Parse updatedAt
  let updatedAt = new Date()
  if (row.UpdatedAt) {
    const parsed = new Date(String(row.UpdatedAt))
    if (!isNaN(parsed.getTime())) {
      updatedAt = parsed
    }
  }

  return {
    id: String(row.ID || ''),
    type: (String(row.Type || 'note')) as ItemType,
    title: String(row.Title || ''),
    content: String(row.Content || ''),
    url: row.URL ? String(row.URL) : null,
    priority: row.Priority ? (String(row.Priority) as Priority) : null,
    deadline,
    completed: String(row.Completed).toUpperCase() === 'TRUE',
    tagNames: row.Tags ? String(row.Tags).split(',').map(s => s.trim()).filter(Boolean) : [],
    categoryName: row.Category ? String(row.Category) : null,
    projectName: row.Project ? String(row.Project) : null,
    updatedAt,
    rowIndex: row._rowIndex,
  }
}
