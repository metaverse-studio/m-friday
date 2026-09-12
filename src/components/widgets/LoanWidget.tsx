import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTy, formatTyRawFixed1 } from '@/lib/data/format'

export function LoanWidget() {
  const { outstanding, limit, nearest } = fixtures.loan
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
          03 KHẾ ƯỚC NHẬN NỢ
        </p>

        <div className="mt-2.5">
          <div className="flex justify-between items-center gap-2.5 py-3 border-b border-white/10">
            <span className="font-medium text-[12.5px] leading-[1.35] text-white/85">
              Khế ước gần nhất
              <span className="block font-normal text-[10.5px] leading-[1.4] text-white/40 mt-0.5">
                Đáo hạn {nearest.dueDate} · {formatPercent(nearest.annualRate * 100)}/năm
              </span>
            </span>
            <span className="font-bold text-[13px] leading-[1.3] text-white shrink-0">
              {formatTy(nearest.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2.5 py-3 border-b border-white/10">
            <span className="font-medium text-[12.5px] leading-[1.35] text-white/85">
              Khế ước 02
              <span className="block font-normal text-[10.5px] leading-[1.4] text-white/40 mt-0.5">
                Đáo hạn 14/10 · 6,8%/năm
              </span>
            </span>
            <span className="font-bold text-[13px] leading-[1.3] text-white shrink-0">
              17,0 tỷ
            </span>
          </div>

          <div className="flex justify-between items-center gap-2.5 py-3 border-b border-white/10">
            <span className="font-medium text-[12.5px] leading-[1.35] text-white/85">
              Khế ước 03
              <span className="block font-normal text-[10.5px] leading-[1.4] text-white/40 mt-0.5">
                Đáo hạn 02/11 · 6,8%/năm
              </span>
            </span>
            <span className="font-bold text-[13px] leading-[1.3] text-white shrink-0">
              12,5 tỷ
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
