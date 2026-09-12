'use client'

import { useState } from 'react'
import { fxFloatRisk, fxForwardCost, fxSaving } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTrieu, formatTrieuRaw } from '@/lib/data/format'
import { getIntent } from '@/lib/intents/registry'
import { useSession } from '@/lib/session'

export function FxForwardWidget() {
  const { spotSellRate, forwardRate, twoWeekChangePercent } = fixtures.fx
  const { pendingLc } = fixtures.tradeFinance
  const requestFido = useSession((s) => s.requestFido)
  const [placed, setPlaced] = useState(false)

  const handleApprove = () => {
    requestFido(getIntent('FX_FORWARD').fidoLabel ?? '', () => {
      setPlaced(true)
    })
  }

  // 14 days bars (9 dim + 5 orange)
  const bars = [34, 38, 36, 44, 48, 46, 55, 59, 64, 70, 76, 82, 91, 100]

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <div className="flex items-start justify-between">
        <p className="font-bold text-caption tracking-[0.16em] uppercase text-white/45 m-0">
          Tỷ giá bán USD/VND
        </p>
        <span className="font-bold text-caption text-msb-orange uppercase">
          ▲ +{formatPercent(twoWeekChangePercent)} / 2 TUẦN
        </span>
      </div>

      <p className="mt-2.5 font-bold text-h3 tracking-[-0.02em] text-white m-0">
        {spotSellRate.toLocaleString('vi-VN')}
      </p>

      <p className="mt-2 font-medium text-caption text-white/55 m-0">
        Khoản thanh toán {pendingLc.partner} · {pendingLc.amountUsd.toLocaleString('vi-VN')} USD · đáo hạn {pendingLc.dueDate}
      </p>

      {/* 14-day trend bar chart */}
      <div className="mt-4 h-[62px] flex items-end gap-[3px] border-b border-white/12 pb-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-[2px] transition-all ${i >= 9 ? 'bg-msb-orange' : 'bg-white/15'}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* 2-column scenario comparison */}
      <div className="grid grid-cols-2 mt-4 border border-white/12 rounded-[8px] overflow-hidden">
        <div className="p-3 border-r border-white/12 bg-white/[0.02]">
          <p className="font-bold text-caption tracking-[0.14em] text-white/40 m-0 uppercase">
            THẢ NỔI
          </p>
          <p className="mt-2 font-bold text-title text-msb-orange m-0">
            {formatTrieuRaw(fxFloatRisk())} tr
          </p>
          <p className="mt-1 font-normal text-caption text-white/35 m-0">
            chi phí phát sinh
          </p>
        </div>

        <div className="p-3 bg-signal/10">
          <p className="font-bold text-caption tracking-[0.14em] text-white/40 m-0 uppercase">
            KHÓA KỲ HẠN
          </p>
          <p className="mt-2 font-bold text-title text-signal m-0">
            {formatTrieuRaw(fxForwardCost())} tr
          </p>
          <p className="mt-1 font-normal text-caption text-white/35 m-0">
            tại {forwardRate.toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      <p className="mt-3.5 font-bold text-small text-msb-gold m-0">
        Tiết kiệm ròng khoảng {formatTrieu(fxSaving())} VNĐ
      </p>

      {placed ? (
        <div className="mt-3.5 p-3.5 bg-signal/15 border border-signal/40 text-signal font-bold text-caption uppercase text-center rounded-[8px]">
          ✓ ĐÃ ĐẶT LỆNH KỲ HẠN THÀNH CÔNG
        </div>
      ) : (
        <button
          type="button"
          onClick={handleApprove}
          className="btn-primary-msb w-full mt-3.5 p-3.5 px-4 flex items-center justify-between font-bold text-caption tracking-[0.1em] uppercase text-white cursor-pointer"
        >
          <span>ĐẶT LỆNH KỲ HẠN · FIDO</span>
          <span className="font-bold text-small">→</span>
        </button>
      )}
    </div>
  )
}
