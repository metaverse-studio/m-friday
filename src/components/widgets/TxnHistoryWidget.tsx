import { formatAmountVnd } from '@/lib/data/format'
import { transactions } from '@/lib/data/txns'

export function TxnHistoryWidget() {
  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="font-bold text-[9.5px] leading-none tracking-[0.16em] uppercase text-white/45 m-0">
        Biến động số dư trong ngày
      </p>

      <div className="mt-3.5 border-t border-white/12">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex gap-2.5 items-start py-3 border-b border-white/12"
          >
            <span className="w-[34px] shrink-0 font-bold text-[11px] leading-[1.4] text-white/40">
              {txn.time}
            </span>
            <span className="flex-1 font-medium text-[12.5px] leading-[1.35] text-white/85">
              {txn.description}
              <span className="block font-normal text-[10px] leading-[1.4] text-white/35 mt-0.5">
                {txn.account}
              </span>
            </span>
            <span
              className={`shrink-0 font-bold text-[12.5px] leading-[1.4] ${
                txn.direction === 'in' ? 'text-signal' : 'text-msb-orange'
              }`}
            >
              {txn.direction === 'in' ? '+' : '−'}
              {formatAmountVnd(txn.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
