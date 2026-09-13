'use client'

import { getIntent } from '@/lib/intents/registry'
import type { IntentId, SlotValue } from '@/lib/intents/types'
import { useSession } from '@/lib/session'

type Props = {
  onSelect: (id: IntentId) => void
  onSlotPick: (value: SlotValue) => void
  onSlotCancel: () => void
}

const CHIP_BASE =
  'shrink-0 px-3.5 py-2 rounded-full font-medium text-caption transition-all cursor-pointer'

export function ChipBar({ onSelect, onSlotPick, onSlotCancel }: Props) {
  const chips = useSession((s) => s.chips)
  const pendingSlot = useSession((s) => s.pendingSlot)
  const toggleDrawer = useSession((s) => s.toggleDrawer)

  /**
   * Friday đang chờ một tham số: chip bar biến thành các lựa chọn của tham số
   * đó. Giữ nguyên chip nghiệp vụ ở đây là mời người dùng bỏ rơi lượt đang
   * chờ — còn nút Thôi là đường lui bắt buộc khi micro hỏng giữa chừng.
   */
  if (pendingSlot) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 pt-3">
        {pendingSlot.slot.options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onSlotPick(option.value)}
            className={`${CHIP_BASE} bg-msb-gold/15 hover:bg-msb-gold/25 border border-msb-gold/60 text-msb-gold font-bold`}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onSlotCancel}
          className={`${CHIP_BASE} bg-transparent border border-white/25 hover:border-white/50 text-white/60 hover:text-white/90`}
        >
          Thôi
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 pt-3">
      {chips.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`${CHIP_BASE} bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 hover:border-msb-gold/50 text-white/90 hover:text-white`}
        >
          {getIntent(id).label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => toggleDrawer(true)}
        className="shrink-0 px-3.5 py-2 rounded-full bg-transparent border border-msb-gold/50 hover:bg-msb-gold/15 font-bold text-caption tracking-[0.04em] text-msb-gold transition-all cursor-pointer"
      >
        TẤT CẢ ▸
      </button>
    </div>
  )
}
