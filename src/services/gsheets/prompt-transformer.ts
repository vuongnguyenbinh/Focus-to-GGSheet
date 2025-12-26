/**
 * Transform between local Prompt format and Google Sheet row format
 */

import type { Prompt, PromptType, QualityRating } from '@/types'
import type { SheetRow } from './api-client'

/**
 * Convert local Prompt to Sheet row format
 */
export function promptToSheetRow(prompt: Prompt): SheetRow {
  return {
    ID: prompt.id,
    Title: prompt.title,
    Description: prompt.description || '',
    Prompt: prompt.prompt || '',
    Type: prompt.type,
    Category: prompt.category || '',
    Tags: prompt.tags.join(','),
    Note: prompt.note || '',
    Approved: prompt.approved ? 'TRUE' : 'FALSE',
    Favorite: prompt.favorite ? 'TRUE' : 'FALSE',
    Quality: prompt.quality ? String(prompt.quality) : '',
    TextDemo: prompt.textDemo || '',
    URLDemo: prompt.urlDemo || '',
    UpdatedAt: prompt.updatedAt.toISOString(),
  }
}

/**
 * Parsed Sheet prompt - intermediate format
 */
export interface ParsedSheetPrompt {
  id: string
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
  urlDemo: string | null
  updatedAt: Date
  rowIndex?: number
}

/**
 * Parse Sheet row to Prompt format
 */
export function sheetRowToPrompt(row: SheetRow): ParsedSheetPrompt {
  // Parse quality rating (1-5)
  let quality: QualityRating | null = null
  if (row.Quality) {
    const parsed = parseInt(String(row.Quality), 10)
    if (parsed >= 1 && parsed <= 5) {
      quality = parsed as QualityRating
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
    title: String(row.Title || ''),
    description: String(row.Description || ''),
    prompt: String(row.Prompt || ''),
    type: (String(row.Type || 'text')) as PromptType,
    category: row.Category ? String(row.Category) : null,
    tags: row.Tags ? String(row.Tags).split(',').map(s => s.trim()).filter(Boolean) : [],
    note: String(row.Note || ''),
    approved: String(row.Approved).toUpperCase() === 'TRUE',
    favorite: String(row.Favorite).toUpperCase() === 'TRUE',
    quality,
    textDemo: row.TextDemo ? String(row.TextDemo) : null,
    urlDemo: row.URLDemo ? String(row.URLDemo) : null,
    updatedAt,
    rowIndex: row._rowIndex,
  }
}
