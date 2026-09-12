import { obligationTotal } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatTy, formatTyRaw } from '@/lib/data/format'

export function ObligationWidget() {
  const { vatDue, payroll, operatingReserve } = fixtures.obligations

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-white/45 m-0">
        Nghĩa vụ chi · 30 ngày tới
      </p>

      <p className="mt-2.5 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-msb-orange m-0">
        {formatTyRaw(obligationTotal())}
        <span className="font-bold text-[14px] text-msb-orange/70"> TỶ VNĐ</span>
      </p>

      {/* 3 rows */}
      <div className="mt-4 border-t border-white/12">
        <div className="flex gap-3 items-start py-3 border-b border-white/12">
          <span className="w-10 shrink-0 font-bold text-[12px] leading-[1.3] text-msb-gold">
            {vatDue.date}
          </span>
          <span className="flex-1 font-medium text-[13px] leading-[1.35] text-white/85">
            {vatDue.label}
          </span>
          <span className="font-bold text-[13px] leading-[1.3] text-white">
            {formatTy(vatDue.amount)}
          </span>
        </div>

        <div className="flex gap-3 items-start py-3 border-b border-white/12">
          <span className="w-10 shrink-0 font-bold text-[12px] leading-[1.3] text-msb-gold">
            {payroll.date}
          </span>
          <span className="flex-1 font-medium text-[13px] leading-[1.35] text-white/85">
            {payroll.label}
            <span className="block font-normal text-[11px] leading-[1.4] text-white/40 mt-0.5">
              {payroll.headcount} nhân sự
            </span>
          </span>
          <span className="font-bold text-[13px] leading-[1.3] text-white">
            {formatTy(payroll.amount)}
          </span>
        </div>

        <div className="flex gap-3 items-start py-3 border-b border-white/12">
          <span className="w-10 shrink-0 font-bold text-[12px] leading-[1.3] text-white/30">
            —
          </span>
          <span className="flex-1 font-medium text-[13px] leading-[1.35] text-white/85">
            Dự phòng vận hành
          </span>
          <span className="font-bold text-[13px] leading-[1.3] text-white">
            {formatTy(operatingReserve)}
          </span>
        </div>
      </div>

      <p className="mt-3.5 font-normal text-[12px] leading-[1.45] text-white/50 m-0">
        Số dư khả dụng {formatTy(fixtures.balance.availableVnd)} VNĐ — hoàn toàn đủ đáp ứng.
      </p>
    </div>
  )
}
