import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTy, formatTyRawFixed1 } from '@/lib/data/format'

export function LoanWidget() {
  const { outstanding, limit, contractCount, contracts } = fixtures.loan
  const available = limit - outstanding

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-white/45 m-0">
        Dư nợ vay ngắn hạn
      </p>

      <p className="mt-2.5 font-bold text-[28px] md:text-[30px] leading-none tracking-[-0.02em] text-white m-0">
        {formatTyRawFixed1(outstanding)}
        <span className="font-bold text-[14px] text-white/50"> TỶ VNĐ</span>
      </p>

      <p className="mt-2 font-medium text-[12.5px] leading-[1.4] text-white/55 m-0">
        Trên hạn mức {formatTy(limit)} · còn khả dụng {formatTy(available)}
      </p>

      <div className="mt-3.5 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-msb-orange rounded-full transition-all"
          style={{ width: `${(outstanding / limit) * 100}%` }}
        />
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/12">
        <p className="font-bold text-[9px] leading-none tracking-[0.16em] text-msb-gold uppercase m-0">
          {String(contractCount).padStart(2, '0')} KHẾ ƯỚC NHẬN NỢ
        </p>

        <div className="mt-2.5">
          {contracts.map((contract) => (
            <div
              key={contract.label}
              className="flex justify-between items-center gap-2.5 py-3 border-b border-white/10"
            >
              <span className="font-medium text-[12.5px] leading-[1.35] text-white/85">
                {contract.label}
                <span className="block font-normal text-[10.5px] leading-[1.4] text-white/40 mt-0.5">
                  Đáo hạn {contract.dueDate} · {formatPercent(contract.annualRate * 100)}/năm
                </span>
              </span>
              <span className="font-bold text-[13px] leading-[1.3] text-white shrink-0">
                {formatTy(contract.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
