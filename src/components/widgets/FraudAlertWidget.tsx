'use client'

import { fixtures } from '@/lib/data/fixtures'
import { formatTrieuRaw } from '@/lib/data/format'
import { useVoiceTurn } from '@/lib/useVoiceTurn'

export function FraudAlertWidget() {
  const { amount, makerName, createdAt, signals } = fixtures.fraud
  const { runIntent } = useVoiceTurn()

  const handleReject = () => {
    void runIntent('REJECT_ORDER')
  }

  return (
    <div className="rounded-[12px] bg-[#601B16]/85 border border-alert/50 p-5 shadow-[0_8px_32px_rgba(240,68,56,0.15)] animate-[riseIn_0.3s_ease-out]">
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full bg-alert flex items-center justify-center text-white text-caption font-bold">
          !
        </div>
        <p className="font-bold text-caption tracking-[0.16em] uppercase text-alert m-0">
          Giao dịch cần xem kỹ
        </p>
      </div>

      <p className="mt-3 font-bold text-h3 tracking-[-0.02em] text-white m-0">
        {formatTrieuRaw(amount)}
        <span className="font-bold text-small text-white/50"> TRIỆU VNĐ</span>
      </p>

      <p className="mt-2 font-normal text-caption text-white/55 m-0">
        Maker {makerName} · tạo lúc {createdAt}
      </p>

      {/* 3 signals */}
      <div className="mt-4 border-t border-alert/30">
        {signals.map((signal, idx) => (
          <div
            key={signal}
            className="flex gap-2.5 py-2.5 border-b border-white/10 font-normal text-caption text-white/80"
          >
            <span className="font-bold text-caption text-alert shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span>{signal}</span>
          </div>
        ))}
      </div>

      <p className="mt-3.5 bg-[#601B16] border border-alert/30 rounded-[8px] p-3 font-medium text-caption text-[#F9B4AF] m-0">
        Em đã tạm giữ lệnh này, chờ anh xác nhận.
      </p>

      <button
        type="button"
        onClick={handleReject}
        className="w-full mt-3 p-3.5 px-4 flex items-center justify-between rounded-[8px] bg-transparent border border-alert/70 hover:bg-alert/15 font-bold text-caption tracking-[0.08em] uppercase text-alert transition-all cursor-pointer"
      >
        <span>TRẢ LỆNH VỀ MAKER</span>
        <span className="font-bold text-small">→</span>
      </button>
    </div>
  )
}
