import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: SearchBarProps) {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder ?? t('common.searchPlaceholder')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div
      className={`
        flex items-center gap-2 h-9 px-3 rounded-lg border
        bg-[var(--bg-secondary)] transition-colors
        ${isFocused
          ? 'border-brand ring-2 ring-brand/20'
          : 'border-[var(--border-color)]'
        }
      `}
    >
      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={defaultPlaceholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </div>
  )
}
