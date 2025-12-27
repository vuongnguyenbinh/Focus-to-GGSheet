import { useState } from 'react'
import { Globe, Mail, Copy, Check, Facebook, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const AUTHOR_INFO = {
  name: 'Bình Vương',
  website: 'https://binhvuong.vn',
  email: 'contact@binhvuong.vn',
  facebook: 'https://www.facebook.com/vuongnguyenbinh88/',
  userGuide: 'https://binhvuong.vn/focus-to-notion',
}

const BANK_INFO = {
  bank: 'Techcombank',
  accountNumber: '0963738833',
  content: 'Mời Bình Vương Cafe',
  qrUrl: 'https://qr.sepay.vn/img?bank=Techcombank&acc=0963738833&template=compact&amount=&des=Moi+Binh+Vuong+Cafe',
}

/**
 * Introduction tab - Full author profile with all sections
 */
export function IntroTab() {
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
    <div className="space-y-5">
      {/* Logo + Name */}
      <div className="text-center">
        <img
          src={chrome.runtime.getURL('icons/icon-128.png')}
          alt="Logo"
          className="w-16 h-16 mx-auto mb-2"
        />
        <h3 className="font-semibold text-lg">{t('author.greeting', { name: AUTHOR_INFO.name })}</h3>
      </div>

      {/* About section */}
      <section>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('author.about')}
        </p>
      </section>

      {/* Extension idea section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">{t('author.extensionIdea')}</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('author.extensionStory')}
        </p>
      </section>

      {/* Story section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">{t('author.andThen')}</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('author.shareStory')}
        </p>
      </section>

      {/* Mission section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">{t('author.mission')}</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('author.missionText')}
        </p>
        <p className="text-sm text-[var(--text-primary)] font-medium mt-3 text-center">
          {t('author.wishText')} ✨
        </p>
      </section>

      {/* Coffee invitation section */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-brand">{t('author.coffeeTitle')}</h4>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
          {/* QR Code - larger size */}
          <div className="flex justify-center mb-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              {!qrError ? (
                <img
                  src={BANK_INFO.qrUrl}
                  alt="QR"
                  className="w-44 h-44"
                  onError={() => setQrError(true)}
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500">
                  {t('author.qrUnavailable')}
                </div>
              )}
            </div>
          </div>

          {/* Bank details */}
          <div className="text-center text-sm space-y-1">
            <p>
              <span className="text-[var(--text-secondary)]">{t('author.bank')}:</span>{' '}
              <span className="font-medium">{BANK_INFO.bank}</span>
            </p>
            <p className="flex items-center justify-center gap-1.5">
              <span className="text-[var(--text-secondary)]">{t('author.accountNumber')}:</span>{' '}
              <span className="font-medium font-mono">{BANK_INFO.accountNumber}</span>
              <button
                onClick={handleCopyAccount}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={copied ? t('author.copied') : t('author.copy')}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-[var(--text-secondary)]" />
                )}
              </button>
            </p>
            <p>
              <span className="text-[var(--text-secondary)]">{t('author.content')}:</span>{' '}
              <span className="font-medium">{t('author.coffeeContent')}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">{t('author.contact')}</h4>
        <div className="space-y-2">
          <a
            href={AUTHOR_INFO.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>binhvuong.vn</span>
          </a>
          <a
            href={`mailto:${AUTHOR_INFO.email}`}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>{AUTHOR_INFO.email}</span>
          </a>
          <a
            href={AUTHOR_INFO.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <Facebook className="w-4 h-4" />
            <span>{t('author.facebook')}</span>
          </a>
          <a
            href={AUTHOR_INFO.userGuide}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('author.userGuide')}</span>
          </a>
        </div>
      </section>

      {/* Request form hint */}
      <section className="text-center pt-2 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-secondary)]">
          {t('author.requestHint')}
        </p>
      </section>
    </div>
  )
}
