'use client'

import { useEffect, useState } from 'react'
import { Share, PlusSquare, X, Download } from 'lucide-react'

type Platform = 'ios' | 'android' | 'other'

export function InstallPromptModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Kiểm tra nếu đã đang chạy ở chế độ Standalone (đã thêm ra màn hình chính)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as any).standalone) ||
      document.referrer.includes('android-app://')

    if (isStandalone) return

    // Hỗ trợ tham số debug/demo trên browser máy tính: ?prompt_install=1
    const urlParams = new URLSearchParams(window.location.search)
    const forceShow = urlParams.get('prompt_install') === '1'

    // 2. Kiểm tra nếu người dùng đã từng đóng gợi ý
    const isDismissed = localStorage.getItem('msb_pwa_dismissed') === 'true'
    if (isDismissed && !forceShow) return

    // 3. Nhận diện nền tảng
    const ua = navigator.userAgent || ''
    const isIos = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream
    const isAndroid = /android/i.test(ua)

    if (isIos) {
      setPlatform('ios')
      // Đợi 2.5s sau khi mở trang để người dùng nắm giao diện rồi mới gợi ý
      const timer = setTimeout(() => setIsOpen(true), 2500)
      return () => clearTimeout(timer)
    }

    if (isAndroid || forceShow) {
      setPlatform('android')
    }

    // 4. Lắng nghe sự kiện beforeinstallprompt của Chromium/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('android')
      setIsOpen(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    if (forceShow && !isIos) {
      setIsOpen(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult?.outcome === 'accepted') {
        setIsOpen(false)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback khi click ở môi trường không có deferred prompt
      setIsOpen(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('msb_pwa_dismissed', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-[#090E17]/75 backdrop-blur-sm animate-[riseIn_0.25s_ease-out]">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0D2745] border border-white/15 border-t-white/50 rounded-[20px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white relative">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-3 h-3 bg-msb-orange rounded-[3px]" />
          <span className="font-bold text-small tracking-wide text-white">MSB</span>
          <span className="font-bold text-caption tracking-[0.16em] text-msb-gold uppercase">
            BUSINESS
          </span>
        </div>

        {/* Tiêu đề */}
        <h3 className="text-body sm:text-title font-bold text-white tracking-tight m-0">
          Cài đặt MSB Business
        </h3>
        <p className="mt-2 text-caption sm:text-small text-white/70 m-0">
          Thêm ứng dụng vào Màn hình chính để sử dụng chế độ <strong className="text-white font-semibold">Toàn màn hình (Full-Screen)</strong> không bị che khuất bởi thanh địa chỉ trình duyệt.
        </p>

        {/* Nội dung theo nền tảng */}
        {platform === 'ios' ? (
          <div className="mt-4 p-3.5 rounded-[12px] bg-card/90 border border-white/10 flex flex-col gap-2.5">
            <p className="text-caption font-semibold uppercase tracking-wider text-msb-gold m-0">
              Hướng dẫn cài đặt trên iOS (Safari):
            </p>
            <div className="flex items-start gap-2.5 text-caption text-white/85">
              <span className="w-5 h-5 rounded-full bg-msb-gold/20 text-msb-gold font-bold text-caption flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div className="flex-1">
                Bấm vào nút <span className="font-semibold text-white">Chia sẻ</span> (
                <Share className="w-3.5 h-3.5 inline-block mx-0.5 text-link" />) ở thanh công cụ dưới cùng Safari.
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-caption text-white/85">
              <span className="w-5 h-5 rounded-full bg-msb-gold/20 text-msb-gold font-bold text-caption flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div className="flex-1">
                Cuộn xuống danh sách và chọn{' '}
                <span className="font-semibold text-white">Thêm vào MH chính</span> (
                <PlusSquare className="w-3.5 h-3.5 inline-block mx-0.5 text-signal" />
                <span className="text-white/60"> hoặc Add to Home Screen</span>).
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 p-3.5 btn-primary-msb shadow-[0_4px_16px_rgba(244,96,12,0.35)] cursor-pointer font-bold text-caption uppercase tracking-wider transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Thêm vào màn hình chính</span>
            </button>
          </div>
        )}

        {/* Nút bỏ qua */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-caption text-white/45 hover:text-white/80 cursor-pointer font-medium transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  )
}
