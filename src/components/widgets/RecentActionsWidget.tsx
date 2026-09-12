'use client'

import { fixtures } from '@/lib/data/fixtures'
import { formatTyRaw } from '@/lib/data/format'

export function RecentActionsWidget() {
  const { postedCount, postedTotal, postedValue, pendingInternational, pendingGuarantee } =
    fixtures.session

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-white/45 m-0">
        Phiên giao dịch hôm nay
      </p>

      <p className="mt-2.5 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-white m-0">
        {postedCount}
        <span className="text-white/35">/{postedTotal}</span>
        <span className="font-bold text-[13px] leading-none text-white/50"> LỆNH HẠCH TOÁN</span>
      </p>

      <p className="mt-2 font-normal text-[12.5px] leading-[1.4] text-white/55 m-0">
        Tổng giá trị {formatTyRaw(postedValue)} tỷ VNĐ · thành công 100%
      </p>

      <div className="h-[1px] bg-white/12 mt-4" />

      <p className="mt-3.5 font-bold text-[9px] leading-none tracking-[0.16em] text-msb-gold uppercase m-0">
        ĐANG CHỜ ANH PHÊ DUYỆT
      </p>

      <div className="mt-2.5 border-t border-white/12">
        <div className="flex gap-3 py-3 border-b border-white/12 items-center">
          <span className="w-6 h-6 rounded-full bg-msb-gold/20 border border-msb-gold/60 flex items-center justify-center font-bold text-[11px] text-msb-gold shrink-0">
            {String(pendingInternational).padStart(2, '0')}
          </span>
          <span className="flex-1 font-medium text-[13px] leading-[1.35] text-white/85">
            Lệnh thanh toán quốc tế
            <span className="block font-normal text-[11px] leading-[1.4] text-white/40 mt-0.5">
              Siemens AG · 250.000 USD
            </span>
          </span>
        </div>

        <div className="flex gap-3 py-3 border-b border-white/12 items-center">
          <span className="w-6 h-6 rounded-full bg-msb-gold/20 border border-msb-gold/60 flex items-center justify-center font-bold text-[11px] text-msb-gold shrink-0">
            {String(pendingGuarantee).padStart(2, '0')}
          </span>
          <span className="flex-1 font-medium text-[13px] leading-[1.35] text-white/85">
            Đề nghị phát hành bảo lãnh
            <span className="block font-normal text-[11px] leading-[1.4] text-white/40 mt-0.5">
              KCN VSIP III · 5,2 tỷ VNĐ
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
