import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { InstallPromptModal } from '@/components/pwa/InstallPromptModal'
import './globals.css'

/**
 * Thiết kế MSB Business dùng Inter ở cả 4 weight 400/500/600/700 (đọc từ
 * Figma "[MB] Chuyển tiền đơn - [CTB EB]"). next/font tự host file woff2 dưới
 * /_next/static/media nên service worker precache được — bản demo chạy
 * offline vẫn đúng font, thay vì rơi về system-ui như khi nạp từ CDN.
 * Subset vietnamese là bắt buộc: toàn bộ lời thoại là tiếng Việt có dấu.
 */
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'MSB Business',
  description: 'Trợ lý Quan hệ Khách hàng Ảo dành cho Khách hàng Doanh nghiệp MSB',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MSB Business',
  },
}

export const viewport: Viewport = {
  themeColor: '#13161B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-dvh bg-obsidian text-white antialiased font-sans">
        <ServiceWorkerRegister />
        <InstallPromptModal />
        {children}
      </body>
    </html>
  )
}
