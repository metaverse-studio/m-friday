'use client'

import React, { useEffect, useRef } from 'react'
import { useSession } from '@/lib/session'
import { initHologramScene } from './hologram-scene'

interface HologramRMProps {
  size?: number | string
  interactive?: boolean
  onClick?: () => void
  className?: string
  showStatusBadge?: boolean
}

export function HologramRM({
  size = 220,
  interactive = true,
  onClick,
  className = '',
  showStatusBadge = false,
}: HologramRMProps) {
  const containerRef = useRef(null as HTMLDivElement | null)
  const isListening = useSession((s) => s.isListening)
  const isSpeaking = useSession((s) => s.isSpeaking)
  const isThinking = useSession((s) => s.isThinking)
  const activeIntent = useSession((s) => s.activeIntent)

  const stateRef = useRef({ isListening, isSpeaking, isThinking, activeIntent })
  useEffect(() => {
    stateRef.current = { isListening, isSpeaking, isThinking, activeIntent }
  }, [isListening, isSpeaking, isThinking, activeIntent])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cleanup = initHologramScene(container, {
      size,
      interactive,
      getState: () => stateRef.current,
    })

    return cleanup
  }, [interactive, size])

  // Badge trạng thái thị giác
  const statusLabel = isListening
    ? 'ĐANG LẮNG NGHE'
    : isSpeaking
    ? 'M-TRÒN ĐANG NÓI'
    : isThinking
    ? 'ĐANG XỬ LÝ...'
    : activeIntent === 'FRAUD_ALERT'
    ? 'CẢNH BÁO RỦI RO'
    : 'M-TRÒN SẴN SÀNG'

  const statusColor = isListening
    ? 'text-msb-gold border-msb-gold/50 bg-msb-gold/10'
    : isSpeaking
    ? 'text-[#3fd0ff] border-[#3fd0ff]/50 bg-[#3fd0ff]/10'
    : activeIntent === 'FRAUD_ALERT'
    ? 'text-red-400 border-red-500/50 bg-red-500/10'
    : 'text-white/70 border-white/15 bg-white/5'

  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  }

  const handleClick = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25)
    }
    onClick?.()
  }

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div
        ref={containerRef}
        onClick={handleClick}
        style={containerStyle}
        className={`relative flex items-center justify-center cursor-pointer select-none touch-none ${
          interactive ? 'hover:scale-105 active:scale-95 transition-transform' : ''
        }`}
        title="Linh vật M-Tròn · Trợ lý ảo Friday · Chạm hoặc kéo để tương tác"
      />

      {showStatusBadge && (
        <div
          className={`mt-2 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-[0.14em] uppercase backdrop-blur-md transition-all ${statusColor}`}
        >
          {statusLabel}
        </div>
      )}
    </div>
  )
}
