/**
 * Google Sheets API client via Apps Script
 * HTTP client for communicating with the deployed Apps Script web app
 */

import { getSettings } from '@/db/operations/settings-operations'

export interface SheetsError {
  status: number
  message: string
}

export interface SheetRow {
  ID: string
  [key: string]: string | number | boolean | undefined
  _rowIndex?: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class GoogleSheetsClient {
  /**
   * Get credentials from settings
   */
  private async getCredentials() {
    const settings = await getSettings()
    if (!settings.sheetsDeploymentUrl || !settings.sheetsSecret) {
      throw new Error('Google Sheets not configured')
    }
    return {
      url: settings.sheetsDeploymentUrl,
      secret: settings.sheetsSecret,
    }
  }

  /**
   * Make HTTP request to Apps Script
   */
  private async request<T>(
    method: 'GET' | 'POST',
    params: Record<string, string> = {},
    body?: unknown
  ): Promise<T> {
    const { url, secret } = await this.getCredentials()

    // Build URL with query params (secret always in params for auth)
    const queryParams = new URLSearchParams({ secret, ...params })
    const fullUrl = `${url}?${queryParams.toString()}`

    const options: RequestInit = { method }
    if (body) {
      options.body = JSON.stringify(body)
      options.headers = { 'Content-Type': 'application/json' }
    }

    const response = await fetch(fullUrl, options)
    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      const error: SheetsError = {
        status: response.status,
        message: data.error || 'Unknown error',
      }
      throw error
    }

    return data.data as T
  }

  // ========================================
  // ITEMS API
  // ========================================

  /**
   * Get all items from sheet
   */
  async getAllItems(): Promise<SheetRow[]> {
    return this.request('GET', { action: 'getItems' })
  }

  /**
   * Get items modified since timestamp (for delta sync)
   */
  async getModifiedItemsSince(timestamp: number): Promise<SheetRow[]> {
    return this.request('GET', { action: 'getItems', since: timestamp.toString() })
  }

  /**
   * Create new item row
   */
  async createItem(data: SheetRow): Promise<{ id: string; rowIndex: number }> {
    return this.request('POST', {}, { action: 'createItem', data })
  }

  /**
   * Update existing item row
   */
  async updateItem(data: SheetRow): Promise<{ id: string; rowIndex: number }> {
    return this.request('POST', {}, { action: 'updateItem', data })
  }

  /**
   * Delete item row
   */
  async deleteItem(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.request('POST', {}, { action: 'deleteItem', id })
  }

  // ========================================
  // PROMPTS API
  // ========================================

  /**
   * Get all prompts from sheet
   */
  async getAllPrompts(): Promise<SheetRow[]> {
    return this.request('GET', { action: 'getPrompts' })
  }

  /**
   * Get prompts modified since timestamp
   */
  async getModifiedPromptsSince(timestamp: number): Promise<SheetRow[]> {
    return this.request('GET', { action: 'getPrompts', since: timestamp.toString() })
  }

  /**
   * Create new prompt row
   */
  async createPrompt(data: SheetRow): Promise<{ id: string; rowIndex: number }> {
    return this.request('POST', {}, { action: 'createPrompt', data })
  }

  /**
   * Update existing prompt row
   */
  async updatePrompt(data: SheetRow): Promise<{ id: string; rowIndex: number }> {
    return this.request('POST', {}, { action: 'updatePrompt', data })
  }

  /**
   * Delete prompt row
   */
  async deletePrompt(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.request('POST', {}, { action: 'deletePrompt', id })
  }

  // ========================================
  // BATCH & UTILITY
  // ========================================

  /**
   * Process multiple operations in batch
   */
  async batch(operations: Array<{
    action: string
    data?: SheetRow
    id?: string
  }>): Promise<Array<{ success: boolean; id?: string; error?: string }>> {
    return this.request('POST', {}, { action: 'batch', operations })
  }

  /**
   * Test connection to Apps Script
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.request<{ ok: boolean; version?: string }>('GET', { action: 'test' })
      return result.ok === true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const sheetsClient = new GoogleSheetsClient()
