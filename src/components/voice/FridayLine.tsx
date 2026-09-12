'use client'

import { useSession } from '@/lib/session'

/**
 * Khoảng lặng giữa lúc nhận lệnh và lúc chunk audio đầu tiên phát ra là
 * khoảng 700ms. Không có gì nhúc nhích trong 700ms đó thì trông như treo máy,
 * nên chỗ chữ hiện skeleton nhấp nháy cho tới khi Friday cất tiếng.
 */
export function FridayLine() {
  const isSpeaking = useSession((s) => s.isSpeaking)
  const isThinking = useSession((s) => s.isThinking)

  return (
    <>
      {isSpeaking && !isThinking && (
        <span className="flex items-end gap-0.5 h-[11px] ml-auto">
          <i className="w-[2px] h-full bg-msb-gold animate-[waveBar_0.7s_ease-in-out_infinite]" />
          <i className="w-[2px] h-full bg-msb-gold animate-[waveBar_0.7s_ease-in-out_0.1s_infinite]" />
          <i className="w-[2px] h-full bg-msb-gold animate-[waveBar_0.7s_ease-in-out_0.2s_infinite]" />
          <i className="w-[2px] h-full bg-msb-gold animate-[waveBar_0.7s_ease-in-out_0.3s_infinite]" />
        </span>
      )}
      {isThinking && (
        <span className="ml-auto font-bold text-caption tracking-[0.16em] text-msb-gold/70 uppercase animate-pulse">
          ĐANG SOẠN
        </span>
      )}
    </>
  )
}

/** Phần chữ, tách riêng vì hai layout đặt nó ở hai chỗ khác nhau trong DOM */
export function FridayText({ className }: { className: string }) {
  const isThinking = useSession((s) => s.isThinking)
  const currentLine = useSession((s) => s.currentLine)

  if (isThinking) {
    return (
      <div className={`${className} flex flex-col gap-1.5 animate-pulse`} aria-hidden>
        <span className="block h-[0.62em] w-full rounded-full bg-white/15" />
        <span className="block h-[0.62em] w-[72%] rounded-full bg-white/10" />
      </div>
    )
  }

  return <p className={className}>{currentLine}</p>
}
