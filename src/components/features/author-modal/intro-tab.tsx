import { useState } from 'react'
import { Globe, Mail, Copy, Check, Facebook, BookOpen } from 'lucide-react'

const AUTHOR_INFO = {
  name: 'Bình Vương',
  website: 'https://binhvuong.vn',
  email: 'contact@binhvuong.vn',
  facebook: 'https://www.facebook.com/vuongnguyenbinh88/',
  userGuide: 'https://binhvuong.vn/notion-sidebar',
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
        <h3 className="font-semibold text-lg">Xin chào! Tôi là {AUTHOR_INFO.name}</h3>
        <p className="text-xs text-[var(--text-tertiary)] italic">Hello! I'm {AUTHOR_INFO.name}</p>
      </div>

      {/* About section */}
      <section>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Tôi là một marketer đam mê việc ứng dụng AI để hệ thống hóa cách thức quản lý và triển khai marketing cho doanh nghiệp.
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
          I'm a marketer passionate about applying AI to systematize management and marketing implementation for businesses.
        </p>
      </section>

      {/* Extension idea section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">Ý tưởng Extension / Extension Idea</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Extension này ban đầu là công cụ được phát triển để team nội bộ và đối tác của tôi có thể làm việc hiệu quả - với khả năng đồng bộ Notion một cách mượt mà, quản lý công việc như một chuyên gia, ghi chú nhanh như chớp, bookmark mọi thứ quan trọng và tương tác hiệu quả với AI thông qua thư viện prompts một cách thông minh!
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
          This extension was originally developed for my internal team and partners to work efficiently - with seamless Notion sync, professional task management, lightning-fast notes, bookmark everything important, and interact effectively with AI through a smart prompts library!
        </p>
      </section>

      {/* Story section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">...Và sau đó / And then</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Sau những phản hồi cực kỳ tích cực từ team và đối tác, tôi quyết định mang "bí kíp" này ra chia sẻ với cộng đồng!
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
          After extremely positive feedback from the team and partners, I decided to share this "secret" with the community!
        </p>
      </section>

      {/* Mission section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">Mong muốn của tôi / My Mission</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Giúp bạn biến đổi quy trình làm việc và tăng năng suất - bởi vì ai cũng xứng đáng được làm việc thông minh hơn, chứ không phải vất vả hơn!
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
          Help you transform your workflow and boost productivity - because everyone deserves to work smarter, not harder!
        </p>
        <p className="text-sm text-[var(--text-primary)] font-medium mt-3 text-center">
          Chúc bạn làm việc hiệu quả! ✨
        </p>
        <p className="text-xs text-[var(--text-tertiary)] italic text-center">
          Wishing you productive work!
        </p>
      </section>

      {/* Coffee invitation section */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-brand">Mời cà phê / Buy me a coffee</h4>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
          {/* QR Code - larger size */}
          <div className="flex justify-center mb-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              {!qrError ? (
                <img
                  src={BANK_INFO.qrUrl}
                  alt="QR Mời cà phê"
                  className="w-44 h-44"
                  onError={() => setQrError(true)}
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500">
                  QR không khả dụng
                </div>
              )}
            </div>
          </div>

          {/* Bank details */}
          <div className="text-center text-sm space-y-1">
            <p>
              <span className="text-[var(--text-secondary)]">Ngân hàng:</span>{' '}
              <span className="font-medium">{BANK_INFO.bank}</span>
            </p>
            <p className="flex items-center justify-center gap-1.5">
              <span className="text-[var(--text-secondary)]">Số TK:</span>{' '}
              <span className="font-medium font-mono">{BANK_INFO.accountNumber}</span>
              <button
                onClick={handleCopyAccount}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Sao chép"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-[var(--text-secondary)]" />
                )}
              </button>
            </p>
            <p>
              <span className="text-[var(--text-secondary)]">Nội dung:</span>{' '}
              <span className="font-medium">{BANK_INFO.content}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-brand">Liên hệ / Contact</h4>
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
            <span>Facebook</span>
          </a>
          <a
            href={AUTHOR_INFO.userGuide}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>User Guide / Hướng dẫn</span>
          </a>
        </div>
      </section>

      {/* Request form hint */}
      <section className="text-center pt-2 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-secondary)]">
          Có ý tưởng tính năng mới? Chuyển sang tab{' '}
          <span className="text-brand font-medium">Yêu cầu</span>{' '}
          để gửi cho tác giả.
        </p>
        <p className="text-xs text-[var(--text-tertiary)] italic mt-0.5">
          Have a feature idea? Switch to the Request tab to send it to the author.
        </p>
      </section>
    </div>
  )
}
