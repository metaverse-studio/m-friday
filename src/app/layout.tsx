import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { InstallPromptModal } from '@/components/pwa/InstallPromptModal'
import './globals.css'

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
  themeColor: '#0D2745',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-obsidian text-white antialiased font-sans">
        <ServiceWorkerRegister />
        <InstallPromptModal />
        {children}
      </body>
    </html>
  )
}
