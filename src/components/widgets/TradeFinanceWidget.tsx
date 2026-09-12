'use client'

import { fixtures } from '@/lib/data/fixtures'
import { formatTyFixed1, formatTyRaw, formatTyRawFixed1 } from '@/lib/data/format'

export function TradeFinanceWidget() {
  const { lc, guarantee, pendingLc, pendingGuarantee } = fixtures.tradeFinance

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-caption tracking-[0.16em] uppercase text-white/45 m-0">
        Hạn mức tài trợ thương mại
      </p>

      {/* L/C Limit */}
      <div className="mt-4">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-caption text-white/70">
            THƯ TÍN DỤNG L/C
          </span>
          <span className="font-bold text-small text-white">
            {formatTyRawFixed1(lc.available)}
            <span className="text-white/40"> / {formatTyFixed1(lc.total)}</span>
          </span>
        </div>
        <div className="mt-2 h-2.5 bg-white/10 rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-msb-gold rounded-[3px]"
            style={{ width: `${(lc.available / lc.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Bank Guarantee Limit */}
      <div className="mt-4">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-caption text-white/70">
            BẢO LÃNH NGÂN HÀNG
          </span>
          <span className="font-bold text-small text-white">
            {formatTyRawFixed1(guarantee.available)}
            <span className="text-white/40"> / {formatTyFixed1(guarantee.total)}</span>
          </span>
        </div>
        <div className="mt-2 h-2.5 bg-white/10 rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-msb-gold rounded-[3px]"
            style={{ width: `${(guarantee.available / guarantee.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="h-[1px] bg-white/12 mt-4.5" />

      <p className="mt-3.5 font-bold text-caption tracking-[0.16em] text-msb-gold uppercase m-0">
        ĐANG CHỜ DUYỆT
      </p>

      <div className="mt-2.5 border-t border-white/12">
        <div className="py-3 border-b border-white/12">
          <p className="font-medium text-small text-white/85 m-0">
            L/C nhập khẩu {pendingLc.partner}
          </p>
          <p className="font-normal text-caption text-white/40 mt-1 m-0">
            {pendingLc.amountUsd.toLocaleString('vi-VN')} USD · đáo hạn {pendingLc.dueDate}
          </p>
        </div>

        <div className="py-3 border-b border-white/12">
          <p className="font-medium text-small text-white/85 m-0">
            Bảo lãnh thực hiện hợp đồng {pendingGuarantee.project}
          </p>
          <p className="font-normal text-caption text-white/40 mt-1 m-0">
            {formatTyRaw(pendingGuarantee.amount)} tỷ VNĐ
          </p>
        </div>
      </div>
    </div>
  )
}
