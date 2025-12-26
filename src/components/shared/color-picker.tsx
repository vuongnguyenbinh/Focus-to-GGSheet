/**
 * Color picker component for tags and projects
 * Provides 8 basic colors for selection
 * Uses Portal to avoid clipping in overflow containers
 */

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// 8 basic colors for tags
export const TAG_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  showAll?: boolean // Show all 8 colors in inline mode
}

export function ColorPicker({ value, onChange, showAll = false }: ColorPickerProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // Inline mode: show 5 or all colors
  if (showAll || !isOpen) {
    const colorsToShow = showAll ? TAG_COLORS : TAG_COLORS.slice(0, 5)
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {colorsToShow.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
              value === color.value ? 'border-gray-800 dark:border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {value === color.value && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </button>
        ))}
        {!showAll && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand flex items-center justify-center text-xs text-[var(--text-secondary)]"
            title={t('common.moreColors')}
          >
            +
          </button>
        )}
      </div>
    )
  }

  // Dropdown mode for full color selection - uses Portal to avoid clipping
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, ready: false })
  const dropdownWidth = 180

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const dropdownHeight = 150

      let left = rect.left
      if (left + dropdownWidth > viewportWidth - 8) {
        left = Math.max(8, viewportWidth - dropdownWidth - 8)
      }

      let top = rect.bottom + 8
      if (top + dropdownHeight > viewportHeight - 8) {
        top = Math.max(8, rect.top - dropdownHeight - 8)
      }

      setPosition({ top, left, ready: true })
    } else {
      setPosition({ top: 0, left: 0, ready: false })
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: value }}
      />

      {isOpen && position.ready &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div
              className="fixed p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-[9999] animate-fade-in min-w-[160px]"
              style={{ top: position.top, left: position.left }}
            >
              <div className="grid grid-cols-4 gap-2.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      onChange(color.value)
                      setIsOpen(false)
                    }}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                      value === color.value ? 'border-gray-800 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {value === color.value && (
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

// Compact color picker for inline editing
interface CompactColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function CompactColorPicker({ value, onChange }: CompactColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, ready: false })
  const menuWidth = 160
  const menuHeight = 120

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Calculate left position with bounds checking
      let left = Math.max(8, rect.right - menuWidth)
      if (left + menuWidth > viewportWidth - 8) {
        left = Math.max(8, viewportWidth - menuWidth - 8)
      }

      // Calculate top position - prefer below, flip to above if needed
      let top = rect.bottom + 8
      if (top + menuHeight > viewportHeight - 8) {
        top = Math.max(8, rect.top - menuHeight - 8)
      }

      setPosition({ top, left, ready: true })
    } else {
      setPosition({ top: 0, left: 0, ready: false })
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
        style={{ backgroundColor: value }}
      />

      {isOpen && position.ready &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            <div
              className="fixed p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-[9999] animate-fade-in min-w-[160px]"
              style={{ top: position.top, left: position.left }}
            >
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      onChange(color.value)
                      setIsOpen(false)
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                      value === color.value ? 'border-gray-800 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {value === color.value && (
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
