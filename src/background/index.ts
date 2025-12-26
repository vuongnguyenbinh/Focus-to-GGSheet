/**
 * Background service worker for Focus to Sheets extension
 * Handles periodic sync and message passing
 */

import { sheetsSyncService } from '@/services/gsheets'
import { getSettings } from '@/db/operations/settings-operations'

interface UrlMetadata {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

/**
 * Fetch and parse metadata from a URL
 * Runs in background to bypass CORS restrictions
 */
async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; FocusToSheets/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    return parseHtmlMetadata(html, url)
  } catch (error) {
    console.error('[FocusToSheets] Failed to fetch URL metadata:', error)
    // Return basic fallback
    return extractFromUrl(url)
  }
}

/**
 * Parse HTML to extract Open Graph and meta tags
 */
function parseHtmlMetadata(html: string, url: string): UrlMetadata {
  // Simple regex-based parsing (more reliable in service worker)
  const getMetaContent = (pattern: RegExp): string | null => {
    const match = html.match(pattern)
    return match ? decodeHtmlEntities(match[1]) : null
  }

  // Extract title
  const ogTitle = getMetaContent(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
  const twitterTitle = getMetaContent(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i)
  const titleTag = getMetaContent(/<title[^>]*>([^<]+)<\/title>/i)
  const title = ogTitle || twitterTitle || titleTag || null

  // Extract description
  const ogDesc = getMetaContent(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
  const twitterDesc = getMetaContent(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i)
  const metaDesc = getMetaContent(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
  const description = ogDesc || twitterDesc || metaDesc || null

  // Extract image
  const ogImage = getMetaContent(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  let image = ogImage || null

  // Make relative URLs absolute
  if (image && !image.startsWith('http')) {
    try {
      image = new URL(image, url).href
    } catch {
      image = null
    }
  }

  // Extract site name
  const siteName = getMetaContent(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
    || getMetaContent(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)

  return { title, description, image, siteName }
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Extract basic info from URL when fetch fails
 */
function extractFromUrl(url: string): UrlMetadata {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.replace('www.', '')
    const title = hostname.charAt(0).toUpperCase() + hostname.slice(1)
    return { title, description: null, image: null, siteName: hostname }
  } catch {
    return { title: null, description: null, image: null, siteName: null }
  }
}

// Open sidepanel on extension icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

// Set up auto-sync alarm based on settings
async function setupAutoSync() {
  const settings = await getSettings()

  // Clear existing alarm
  await chrome.alarms.clear('syncData')

  if (settings.autoSyncEnabled && settings.autoSyncInterval > 0) {
    chrome.alarms.create('syncData', {
      periodInMinutes: settings.autoSyncInterval
    })
    console.log(`[FocusToSheets] Auto-sync enabled: every ${settings.autoSyncInterval} minutes`)
  } else {
    console.log('[FocusToSheets] Auto-sync disabled')
  }
}

// Initialize auto-sync on startup
setupAutoSync()

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncData') {
    console.log('[FocusToSheets] Sync alarm triggered at', new Date().toISOString())

    try {
      // Check if Sheets is configured
      const settings = await getSettings()

      // Double-check if auto-sync is still enabled
      if (!settings.autoSyncEnabled) {
        console.log('[FocusToSheets] Auto-sync disabled, skipping')
        return
      }

      if (!settings.sheetsDeploymentUrl || !settings.sheetsSecret) {
        console.log('[FocusToSheets] Sheets not configured, skipping sync')
        return
      }

      // Process sync queues (items and prompts)
      const result = await sheetsSyncService.fullSync()
      console.log('[FocusToSheets] Sync result:', result)

      // Notify UI if there were changes
      if (result.created > 0 || result.updated > 0 || result.deleted > 0) {
        chrome.runtime.sendMessage({
          type: 'SYNC_COMPLETE',
          payload: result,
        }).catch(() => {
          // Ignore error if no listeners (sidepanel closed)
        })
      }
    } catch (error) {
      console.error('[FocusToSheets] Sync error:', error)
    }
  }
})

// Listen for messages from sidepanel/popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_NOW') {
    // Manual sync request - sync both items and prompts
    (async () => {
      try {
        const result = await sheetsSyncService.fullSync()
        console.log('[FocusToSheets] Sync result:', result)
        sendResponse({ success: true, result })
      } catch (error) {
        console.error('[FocusToSheets] Sync error:', error)
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    })()
    return true // Indicate async response
  }

  if (message.type === 'GET_SYNC_STATUS') {
    // Get current sync status
    sheetsSyncService.getQueueStatus().then((status) => {
      sendResponse({
        isSyncing: sheetsSyncService.syncing,
        ...status,
      })
    })
    return true
  }

  if (message.type === 'RETRY_FAILED') {
    sheetsSyncService.retryFailed().then((count) => {
      sendResponse({ success: true, count })
    })
    return true
  }

  if (message.type === 'FETCH_URL_METADATA') {
    // Fetch metadata from URL (bypass CORS)
    fetchUrlMetadata(message.url).then((metadata) => {
      sendResponse({ success: true, metadata })
    }).catch((error) => {
      sendResponse({ success: false, error: error.message })
    })
    return true
  }

  if (message.type === 'UPDATE_AUTO_SYNC') {
    // Update auto-sync settings
    setupAutoSync().then(() => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Listen for extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[FocusToSheets] Extension installed')
  } else if (details.reason === 'update') {
    console.log('[FocusToSheets] Extension updated to', chrome.runtime.getManifest().version)
  }
})

export {}
