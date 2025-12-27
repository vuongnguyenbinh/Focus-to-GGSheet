import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BANK_INFO = {
  bank: 'Techcombank',
  accountNumber: '0963738833',
  content: 'Mời Bình Vương Cafe',
  qrUrl: 'https://qr.sepay.vn/img?bank=Techcombank&acc=0963738833&template=compact&amount=&des=Moi+Binh+Vuong+Cafe',
}

/**
 * Coffee tab - QR code and bank transfer information
 */
export function CoffeeTab() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [qrError, setQrError] = useState(false)

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="text-center py-2 space-y-4">
      {/* Thank you message */}
      <div>
        <p className="text-sm font-medium">{t('author.thankYou')}</p>
      </div>

      {/* QR Code - larger size */}
      <div className="bg-white p-3 rounded-lg inline-block shadow-sm">
        {!qrError ? (
          <img
            src={BANK_INFO.qrUrl}
            alt="QR"
            className="w-56 h-56"
            onError={() => setQrError(true)}
          />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-500">
            {t('author.qrUnavailable')}
          </div>
        )}
      </div>

      {/* Bank details */}
      <div className="text-sm space-y-1.5">
        <p>
          <span className="text-[var(--text-secondary)]">{t('author.bank')}:</span>{' '}
          <span className="font-medium">{BANK_INFO.bank}</span>
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="text-[var(--text-secondary)]">{t('author.accountNumber')}:</span>{' '}
          <span className="font-medium font-mono">{BANK_INFO.accountNumber}</span>
          <button
            onClick={handleCopyAccount}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={copied ? t('author.copied') : t('author.copy')}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            )}
          </button>
        </p>
        <p>
          <span className="text-[var(--text-secondary)]">{t('author.content')}:</span>{' '}
          <span className="font-medium">{t('author.coffeeContent')}</span>
        </p>
      </div>
    </div>
  )
}
