'use client'

import { getIntent } from '@/lib/intents/registry'
import { useSession } from '@/lib/session'

export function SessionSummaryWidget() {
  const history = useSession((s) => s.history)

  const covered = Array.from(
    new Set(history.filter((id) => id !== 'GREETING' && id !== 'SESSION_SUMMARY')),
  )

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full bg-signal shrink-0 flex items-center justify-center text-[9px] text-[#0D2745] font-bold">
          ✓
        </div>
        <p className="m-0 font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-signal">
          Đã gửi báo cáo phiên làm việc
        </p>
      </div>

      <p className="mt-3 font-medium text-[12.5px] leading-[1.45] text-white/60 m-0">
        Gửi tới hộp thư của Mr Stark · {covered.length} nội dung nghiệp vụ
      </p>

      {covered.length > 0 ? (
        <div className="mt-3.5 border-t border-white/12">
          {covered.map((id) => (
            <div
              key={id}
              className="flex gap-2.5 py-2.5 border-b border-white/10 font-medium text-[12.5px] leading-[1.35] text-white/85"
            >
              <span className="text-msb-gold font-bold">—</span>
              {getIntent(id).label}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3.5 font-medium text-[12px] text-white/40 m-0">
          Phiên này chưa có nội dung nghiệp vụ nào để tổng hợp
        </p>
      )}
    </div>
  )
}

