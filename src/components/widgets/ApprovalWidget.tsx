'use client'

import { fixtures } from '@/lib/data/fixtures'
import { formatTrieuRaw, formatTyRaw } from '@/lib/data/format'
import type { IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'

export function ApprovalWidget({ intent }: { intent?: IntentId } = {}) {
  const sessionIntent = useSession((s) => s.activeIntent)
  const activeIntent = intent ?? sessionIntent
  const isReject = activeIntent === 'REJECT_ORDER'

  const { pendingGuarantee } = fixtures.tradeFinance
  const { amount, makerName } = fixtures.fraud

  if (isReject) {
    return (
      <div className="rounded-[12px] bg-[#1A1417]/95 border border-msb-orange/50 p-5 shadow-[0_8px_32px_rgba(244,96,12,0.15)] animate-[riseIn_0.3s_ease-out]">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-msb-orange flex items-center justify-center text-white text-[9px] font-bold">
            ✕
          </div>
          <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-msb-orange m-0">
            Đã trả lệnh về Maker
          </p>
        </div>

        <p className="mt-3 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-white m-0">
          {formatTrieuRaw(amount)}
          <span className="font-bold text-[14px] text-white/50"> TRIỆU VNĐ</span>
        </p>

        <p className="mt-2 font-normal text-[12.5px] leading-[1.4] text-white/55 m-0">
          Trả về cho Maker {makerName}
        </p>

        <div className="mt-4 border-t border-white/12 pt-3.5">
          <p className="font-bold text-[9px] leading-none tracking-[0.16em] text-msb-gold uppercase m-0">
            GHI CHÚ ĐỌC BẰNG GIỌNG NÓI
          </p>
          <p className="mt-2.5 bg-white/5 border-l-[3px] border-msb-gold rounded-r-[6px] p-3 px-3.5 font-medium text-[13px] leading-[1.45] text-white/85 m-0">
            “thiếu hóa đơn đầu vào”
          </p>
          <p className="mt-2.5 font-normal text-[11px] leading-[1.4] text-white/40 m-0">
            Kế toán nhận thông báo ngay · đã xác thực FIDO
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glass border-signal/50 p-5 shadow-[0_8px_32px_rgba(18,183,106,0.15)] animate-[riseIn_0.3s_ease-out]">
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full bg-signal flex items-center justify-center text-white text-[9px] font-bold">
          ✓
        </div>
        <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-signal m-0">
          Đã ký duyệt điện tử
        </p>
      </div>

      <p className="mt-3 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-white m-0">
        {formatTyRaw(pendingGuarantee.amount)}
        <span className="font-bold text-[14px] text-white/50"> TỶ VNĐ</span>
      </p>

      <p className="mt-2 font-normal text-[12.5px] leading-[1.4] text-white/55 m-0">
        Bảo lãnh thực hiện hợp đồng {pendingGuarantee.project}
      </p>

      <div className="mt-4 border-t border-white/12">
        <div className="flex justify-between py-2 border-b border-white/12 font-medium text-[12.5px] text-white/60">
          <span>Xác thực</span>
          <span className="font-bold text-signal">FIDO Biometric</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/12 font-medium text-[12.5px] text-white/60">
          <span>Hạn mức bảo lãnh còn lại</span>
          <span className="font-bold text-white">6,3 / 30,0 tỷ</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/12 font-medium text-[12.5px] text-white/60">
          <span>Hàng chờ duyệt</span>
          <span className="font-bold text-white">02 lệnh</span>
        </div>
      </div>
    </div>
  )
}
