import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TagProps {
  label: string
  color?: string
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}

export function Tag({
  label,
  color,
  removable = false,
  onRemove,
  onClick,
  size = 'sm',
  className = '',
}: TagProps) {
  const { t } = useTranslation()
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  }

  const baseStyle = color
    ? { backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }
    : undefined

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${sizes[size]}
        ${!color ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      style={baseStyle}
      onClick={onClick}
    >
      <span className="truncate max-w-[100px]">{label}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          title={t('common.delete')}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  )
}
