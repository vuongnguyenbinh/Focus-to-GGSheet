import { useState } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/shared'
import { Button } from '@/components/shared/button'
import { useToast } from '@/stores/toast-context'
import type { FeatureRequestPayload } from '@/types'

const WEBHOOK_URL = 'https://auto.binhvuong.vn/webhook/extensionNE'

interface RequestTabProps {
  onClose: () => void
}

/**
 * Feature request form with webhook submission
 */
export function RequestTab({ onClose }: RequestTabProps) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validate = () => {
    const newErrors: { email?: string } = {}
    if (!form.email.trim()) {
      newErrors.email = 'Email là bắt buộc / Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ / Invalid email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload: FeatureRequestPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        source: 'NotionEX Extension',
        timestamp: new Date().toISOString(),
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed')

      setShowSuccess(true)
      toast.success('Đã gửi thành công!')

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Webhook error:', error)
      toast.error('Không thể gửi. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="font-medium">Cảm ơn bạn!</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Thank you for your feedback!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-sm font-medium">Yêu cầu tính năng</p>
        <p className="text-xs text-[var(--text-secondary)] italic">Feature Request</p>
      </div>

      {/* Form fields */}
      <Input
        label="Tên / Name"
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Nguyễn Văn A"
      />

      <Input
        label="Email *"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="email@example.com"
      />

      <Input
        label="Điện thoại / Phone"
        type="tel"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="0912345678"
      />

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Nội dung / Message
        </label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full h-24 px-3 py-2 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition-colors text-sm resize-none"
          placeholder="Mô tả tính năng bạn muốn... / Describe the feature you want..."
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Gửi / Submit
      </Button>
    </form>
  )
}
