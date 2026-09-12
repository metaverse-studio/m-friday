'use client'

import { useState } from 'react'
import { cctgYield, idleCash, obligationTotal } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTrieuRaw, formatTy, formatTyRaw, formatTyRawFixed1 } from '@/lib/data/format'
import { useSession } from '@/lib/session'

export function CctgWidget() {
  const { principal, termDays, annualRate, bufferKept } = fixtures.cctg
  const requestFido = useSession((s) => s.requestFido)
  const [purchased, setPurchased] = useState(false)

  const handleApprove = () => {
    requestFido('Xác nhận mua Chứng chỉ tiền gửi 15,0 tỷ VNĐ', () => {
      setPurchased(true)
    })
  }

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-msb-gold m-0">
          Chứng chỉ tiền gửi MSB Business
        </p>
        <span className="font-bold text-[8.5px] leading-none tracking-[0.08em] bg-msb-gold text-[#0D2745] px-2 py-1 rounded-full">
          ƯU ĐÃI
        </span>
      </div>

      <p className="mt-3 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-white m-0">
        {formatTyRawFixed1(principal)}
        <span className="font-bold text-[14px] text-white/50"> TỶ VNĐ</span>
      </p>

      <p className="mt-2 font-medium text-[12.5px] leading-[1.4] text-white/55 m-0">
        Kỳ hạn {termDays} ngày · lãi suất {formatPercent(annualRate * 100)}/năm
      </p>

      {/* Breakdown */}
      <div className="mt-4 border-t border-white/12">
        <div className="flex justify-between py-2 border-b border-white/10 font-medium text-[12.5px] leading-[1.3] text-white/60">
          <span>Số dư khả dụng</span>
          <span className="font-bold text-white">{formatTy(fixtures.balance.availableVnd)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10 font-medium text-[12.5px] leading-[1.3] text-white/60">
          <span>Trừ nghĩa vụ sắp tới</span>
          <span className="font-bold text-msb-orange">− {formatTy(obligationTotal())}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10 font-medium text-[12.5px] leading-[1.3] text-white/60">
          <span>Tiền nhàn rỗi</span>
          <span className="font-bold text-white">{formatTy(idleCash())}</span>
        </div>
      </div>

      {/* Yield box */}
      <div className="mt-3.5 bg-signal/10 border border-signal/25 rounded-[8px] p-3.5">
        <p className="font-bold text-[9px] leading-none tracking-[0.14em] text-white/50 m-0 uppercase">
          LỢI TỨC DỰ KIẾN
        </p>
        <p className="mt-1.5 font-bold text-[22px] leading-none text-signal m-0">
          {formatTrieuRaw(cctgYield())} triệu VNĐ
        </p>
        <p className="mt-1.5 font-normal text-[11px] leading-[1.4] text-white/45 m-0">
          Vẫn giữ đệm thanh khoản {formatTyRaw(bufferKept)} tỷ VNĐ
        </p>
      </div>

      {purchased ? (
        <div className="mt-3.5 p-3.5 bg-signal/15 border border-signal/40 text-signal font-bold text-[12px] leading-none uppercase text-center rounded-[8px]">
          ✓ ĐÃ KÝ DUYỆT MUA THÀNH CÔNG
        </div>
      ) : (
        <button
          type="button"
          onClick={handleApprove}
          className="btn-primary-msb w-full mt-3.5 p-3.5 px-4 flex items-center justify-between font-bold text-[12px] leading-none tracking-[0.1em] uppercase text-white cursor-pointer"
        >
          <span>DUYỆT MUA NGAY · FIDO</span>
          <span className="font-bold text-[14px]">→</span>
        </button>
      )}
    </div>
  )
}
