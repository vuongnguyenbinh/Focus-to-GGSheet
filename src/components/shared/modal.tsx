import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Modal component using Portal instead of native <dialog>
 * This allows nested dropdowns (IconPicker, ColorPicker) to display correctly
 * since they also use Portals with z-index layering
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const { t } = useTranslation()

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop - z-[9000] to be below dropdowns (z-[9998/9999]) */}
      <div
        className="fixed inset-0 bg-black/50 z-[9000] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content - z-[9001] to be above backdrop but below dropdowns */}
      <div className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            ${sizes[size]} w-full p-4 rounded-xl shadow-xl pointer-events-auto
            bg-[var(--bg-primary)] text-[var(--text-primary)]
            animate-scale-in
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
