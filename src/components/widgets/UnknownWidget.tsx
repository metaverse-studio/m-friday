'use client'

import { fixtures } from '@/lib/data/fixtures'

export function UnknownWidget() {
  const { rmName, rmPhone } = fixtures.contacts

  return (
    <div className="card-glass p-5 animate-[riseIn_0.3s_ease-out]">
      <p className="m-0 font-bold text-caption tracking-[0.16em] uppercase text-msb-gold">
        Chuyển tiếp chuyên viên
      </p>

      <p className="mt-3 font-medium text-small text-white/80 m-0">
        Nội dung này nằm ngoài phạm vi em hỗ trợ trực tiếp. Để đảm bảo chính xác tuyệt đối, em xin
        phép chuyển anh sang chuyên viên phụ trách ạ.
      </p>

      <div className="flex items-center gap-3 mt-4 border-t border-white/12 pt-3.5">
        <div className="w-[38px] h-[38px] rounded-full bg-msb-gold flex items-center justify-center font-bold text-small text-[#13161B] shrink-0">
          A
        </div>
        <div>
          <p className="m-0 font-bold text-small text-white">
            {rmName}
          </p>
          <p className="mt-1 font-bold text-caption text-msb-gold m-0">
            {rmPhone}
          </p>
        </div>
      </div>
    </div>
  )
}

