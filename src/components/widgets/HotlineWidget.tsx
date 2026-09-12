'use client'

import { useEffect, useRef } from 'react'
import { fixtures } from '@/lib/data/fixtures'
import { useSession } from '@/lib/session'

export function HotlineWidget() {
  const { rmName, rmPhone, hotline } = fixtures.contacts
  const isSpeaking = useSession((s) => s.isSpeaking)
  const ringRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio/ringtone.mp3')
    audio.loop = true
    audio.volume = 0.35
    ringRef.current = audio

    return () => {
      audio.pause()
      ringRef.current = null
    }
  }, [])

  // Chuông chỉ đổ khi Friday đã nói xong, tránh hai luồng âm thanh chồng lên nhau
  useEffect(() => {
    const audio = ringRef.current
    if (!audio) return
    if (isSpeaking) {
      audio.pause()
      return
    }
    void audio.play().catch((error) => console.error('[hotline] chuông bị chặn:', error))
  }, [isSpeaking])

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-caption tracking-[0.16em] uppercase text-signal m-0 flex items-center">
        Đang kết nối
        <span className="inline-block w-2 h-2 rounded-full bg-signal ml-2 animate-[breathe_1.1s_ease-in-out_infinite]" />
      </p>

      {/* Avatar & Contact info */}
      <div className="flex items-center gap-3.5 mt-4">
        <div className="w-14 h-14 rounded-full border border-msb-gold/40 bg-gradient-to-br from-[#1E3A5F] to-[#0D2745] flex items-center justify-center font-bold text-caption text-center text-white/80 shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          RM<br />Friday
        </div>
        <div>
          <p className="font-bold text-title tracking-[-0.01em] text-white m-0">
            {rmName}
          </p>
          <p className="mt-1.5 font-bold text-small text-msb-gold m-0">
            {rmPhone}
          </p>
        </div>
      </div>

      <p className="mt-3.5 font-medium text-caption text-white/50 m-0">
        Giám đốc Quan hệ Khách hàng Doanh nghiệp phụ trách tài khoản
      </p>

      <div className="mt-4 border-t border-white/12 pt-3 flex justify-between items-center font-medium text-caption text-white/50">
        <span>Hotline MSB Priority</span>
        <span className="font-bold text-white">{hotline}</span>
      </div>
    </div>
  )
}
