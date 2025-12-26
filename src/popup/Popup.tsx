import { useState, useEffect } from 'react'
import { PanelLeft, RefreshCw, Settings, CheckCircle, Clock } from 'lucide-react'
import { ThemeProvider } from '@/stores/theme-context'
import { Button } from '@/components/shared'

function PopupContent() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Load sync status - placeholder
    setLastSync(new Date())
    setPendingCount(0)
  }, [])

  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId })
      window.close()
    }
  }

  const handleSync = () => {
    setSyncing(true)
    // Placeholder - will be implemented in Phase 5
    setTimeout(() => {
      setSyncing(false)
      setLastSync(new Date())
    }, 2000)
  }

  const openSettings = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId })
      // TODO: Navigate to settings tab
      window.close()
    }
  }

  const formatLastSync = () => {
    if (!lastSync) return 'Chưa đồng bộ'
    const diff = Date.now() - lastSync.getTime()
    if (diff < 60000) return 'Vừa xong'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
    return `${Math.floor(diff / 3600000)} giờ trước`
  }

  return (
    <div className="w-[300px] bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border-color)]">
        <img src={chrome.runtime.getURL('icons/icon-32.png')} alt="Logo" className="w-6 h-6" />
        <span className="text-sm font-bold">Focus to Notion</span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between px-3 py-2 text-xs border-b border-[var(--border-color)]">
        <div className="flex items-center gap-1.5">
          {pendingCount > 0 ? (
            <>
              <Clock className="w-3 h-3 text-warning" />
              <span>{pendingCount} đang chờ</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Đã đồng bộ</span>
            </>
          )}
        </div>
        <span className="text-[var(--text-secondary)]">{formatLastSync()}</span>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <Button
          variant="primary"
          fullWidth
          icon={<PanelLeft className="w-4 h-4" />}
          onClick={openSidePanel}
        >
          Mở Sidebar
        </Button>
        <Button
          variant="secondary"
          fullWidth
          icon={<RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />}
          onClick={handleSync}
          loading={syncing}
        >
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
        </Button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)]">
        <span>v1.0.0</span>
        <button
          onClick={openSettings}
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings className="w-3 h-3" />
          Cài đặt
        </button>
      </div>
    </div>
  )
}

export default function Popup() {
  return (
    <ThemeProvider>
      <PopupContent />
    </ThemeProvider>
  )
}
