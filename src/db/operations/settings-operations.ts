import { db } from '../schema'
import type { Settings } from '@/types'

const SETTINGS_ID = 'app-settings'

// Get settings (creates defaults if not exists)
export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.get(SETTINGS_ID)
  if (settings) return settings

  // Return defaults
  const defaults: Settings = {
    id: SETTINGS_ID,
    theme: 'light',
    // Notion (deprecated)
    notionToken: null,
    notionDatabaseId: null,
    promptsDatabaseId: null,
    // Google Sheets
    sheetsDeploymentUrl: null,
    sheetsSecret: null,
    // Sync
    lastSyncAt: null,
    promptsLastSyncAt: null,
    autoSyncEnabled: true,
    autoSyncInterval: 5, // 5 minutes default
  }

  await db.settings.add(defaults)
  return defaults
}

// Update
export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  const exists = await db.settings.get(SETTINGS_ID)
  if (!exists) {
    await getSettings() // Create defaults first
  }
  await db.settings.update(SETTINGS_ID, updates)
}

// Theme
export async function setTheme(theme: 'light' | 'dark'): Promise<void> {
  await updateSettings({ theme })
}

export async function getTheme(): Promise<'light' | 'dark'> {
  const settings = await getSettings()
  return settings.theme
}

// Notion credentials
export async function setNotionCredentials(
  token: string,
  databaseId: string
): Promise<void> {
  await updateSettings({ notionToken: token, notionDatabaseId: databaseId })
}

export async function clearNotionCredentials(): Promise<void> {
  await updateSettings({ notionToken: null, notionDatabaseId: null })
}

export async function hasNotionCredentials(): Promise<boolean> {
  const settings = await getSettings()
  return !!(settings.notionToken && settings.notionDatabaseId)
}

// Sync timestamp
export async function updateLastSyncAt(): Promise<void> {
  await updateSettings({ lastSyncAt: Date.now() })
}

export async function getLastSyncAt(): Promise<number | null> {
  const settings = await getSettings()
  return settings.lastSyncAt
}
