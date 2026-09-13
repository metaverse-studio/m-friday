'use client'

import { cashMargin, periodData, periodGrowthInflow } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTy } from '@/lib/data/format'
import { useSession } from '@/lib/session'

export function PeriodCompareWidget() {
  const slots = useSession((s) => s.activeSlots)
  // Tháng khách vừa hỏi; câu nói không nêu tháng thì lấy tháng gần nhất
  const month = String(slots.month ?? fixtures.periodCompare.defaultMonth)
  const { inflowThis, inflowLast, outflowThis, outflowLast } = periodData(month)

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-caption tracking-[0.16em] uppercase text-white/45 m-0">
        {month} so với cùng kỳ
      </p>

      <p className="mt-2.5 font-bold text-h3 tracking-[-0.02em] text-signal m-0">
        +{formatPercent(periodGrowthInflow(month))}
        <span className="font-bold text-small text-white/45"> DÒNG THU</span>
      </p>

      {/* Dòng thu */}
      <div className="mt-4 border-t border-white/12 pt-3.5">
        <div className="flex justify-between font-medium text-caption text-white/60">
          <span className="font-semibold">DÒNG THU</span>
          <span>
            {formatTy(inflowThis)} · trước {formatTy(inflowLast)}
          </span>
        </div>
        <div className="mt-2 h-3 bg-signal rounded-[3px] w-full" />
        <div
          className="mt-1 h-3 bg-white/15 rounded-[3px]"
          style={{ width: `${(inflowLast / inflowThis) * 100}%` }}
        />
      </div>

      {/* Dòng chi */}
      <div className="mt-4">
        <div className="flex justify-between font-medium text-caption text-white/60">
          <span className="font-semibold">DÒNG CHI</span>
          <span>
            {formatTy(outflowThis)} · trước {formatTy(outflowLast)}
          </span>
        </div>
        <div
          className="mt-2 h-3 bg-msb-orange rounded-[3px]"
          style={{ width: `${(outflowThis / inflowThis) * 100}%` }}
        />
        <div
          className="mt-1 h-3 bg-white/15 rounded-[3px]"
          style={{ width: `${(outflowLast / inflowThis) * 100}%` }}
        />
      </div>

      {/* Margin */}
      <div className="flex justify-between mt-4 border-t border-white/12 pt-3 font-normal text-caption text-white/50">
        <span>Biên dòng tiền</span>
        <span className="font-bold text-msb-gold">
          {formatPercent(cashMargin('last', month))} → {formatPercent(cashMargin('this', month))}
        </span>
      </div>

      <p className="mt-2.5 font-normal text-caption text-white/35 m-0">
        Thanh đậm là kỳ này, thanh mờ là cùng kỳ năm trước.
      </p>
    </div>
  )
}
