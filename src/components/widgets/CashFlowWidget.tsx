'use client'

import { fixtures } from '@/lib/data/fixtures'
import { formatTyFixed1, formatTyRaw } from '@/lib/data/format'

export function CashFlowWidget() {
  const { daily, days, asOfDate, inflow, outflow, net } = fixtures.cashFlow
  const peak = Math.max(...daily.map((d) => Math.max(d.inflow, d.outflow)))

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <div className="flex items-start justify-between">
        <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-white/45 m-0">
          Dòng tiền {days} ngày
        </p>
        <p className="font-normal text-[9.5px] leading-none text-white/35 m-0">
          {asOfDate}
        </p>
      </div>

      <p className="mt-2.5 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-signal m-0">
        +{formatTyRaw(net)}
        <span className="font-bold text-[14px] text-signal/70"> TỶ VNĐ</span>
      </p>

      {/* 7-day double bars chart */}
      <div className="mt-4 flex items-end gap-1.5 h-[104px] border-b border-white/12 pb-1">
        {daily.map((day) => (
          <div key={day.label} className="flex-1 flex items-end justify-center gap-0.5 h-full">
            <div
              className="w-[9px] bg-signal rounded-t-[2px] transition-all"
              style={{ height: `${(day.inflow / peak) * 100}%` }}
              title={`Thu: ${formatTyFixed1(day.inflow)}`}
            />
            <div
              className="w-[9px] bg-msb-orange rounded-t-[2px] transition-all"
              style={{ height: `${(day.outflow / peak) * 100}%` }}
              title={`Chi: ${formatTyFixed1(day.outflow)}`}
            />
          </div>
        ))}
      </div>

      {/* Day labels */}
      <div className="flex gap-1.5 pt-2">
        {daily.map((day) => (
          <span
            key={day.label}
            className="flex-1 text-center font-medium text-[10px] leading-none text-white/40"
          >
            {day.label}
          </span>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 mt-4 pt-3.5 border-t border-white/12">
        <div className="pr-3 border-r border-white/12">
          <p className="font-bold text-[9px] leading-none tracking-[0.14em] text-white/40 m-0 uppercase">
            TỔNG THU
          </p>
          <p className="mt-1.5 font-bold text-[18px] md:text-[19px] leading-none text-signal m-0">
            {formatTyFixed1(inflow)}
          </p>
        </div>
        <div className="pl-3">
          <p className="font-bold text-[9px] leading-none tracking-[0.14em] text-white/40 m-0 uppercase">
            TỔNG CHI
          </p>
          <p className="mt-1.5 font-bold text-[18px] md:text-[19px] leading-none text-msb-orange m-0">
            {formatTyFixed1(outflow)}
          </p>
        </div>
      </div>
    </div>
  )
}
