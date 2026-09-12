'use client'

import { getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'

type Props = {
  onSelect: (id: IntentId) => void
}

export function ChipBar({ onSelect }: Props) {
  const chips = useSession((s) => s.chips)
  const toggleDrawer = useSession((s) => s.toggleDrawer)

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 pt-3">
      {chips.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="shrink-0 px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 hover:border-msb-gold/50 font-medium text-[12px] leading-none text-white/90 hover:text-white transition-all cursor-pointer"
        >
          {getIntent(id).label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => toggleDrawer(true)}
        className="shrink-0 px-3.5 py-2 rounded-full bg-transparent border border-msb-gold/50 hover:bg-msb-gold/15 font-bold text-[12px] leading-none tracking-[0.04em] text-msb-gold transition-all cursor-pointer"
      >
        TẤT CẢ ▸
      </button>
    </div>
  )
}
