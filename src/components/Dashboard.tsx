'use client'

import { useEffect, useRef } from 'react'
import { buildTag } from '@/lib/build-info'
import { fixtures } from '@/lib/data/fixtures'
import { formatTyRaw } from '@/lib/data/format'
import { useVoiceTurn } from '@/lib/useVoiceTurn'
import { useSession } from '@/lib/session'
import { FidoModal } from './fido/FidoModal'
import { ChipBar } from './voice/ChipBar'
import { Drawer } from './voice/Drawer'
import { FridayLine, FridayText } from './voice/FridayLine'
import { Orb } from './voice/Orb'
import { WidgetHost } from './widgets/WidgetHost'

export function Dashboard() {
  const { runIntent, startListening, stopListening, cancelListening } = useVoiceTurn()
  const activeIntent = useSession((s) => s.activeIntent)
  const isSpeaking = useSession((s) => s.isSpeaking)
  const isListening = useSession((s) => s.isListening)
  const lastLatencyMs = useSession((s) => s.lastLatencyMs)
  const greeted = useRef(false)

  useEffect(() => {
    if (greeted.current) return
    greeted.current = true
    void runIntent('GREETING')
  }, [runIntent])

  const talkButtonText = isSpeaking
    ? 'CHẠM ĐỂ NGẮT LỜI'
    : isListening
    ? 'HOÀN THÀNH NÓI'
    : 'CHẠM ĐỂ NÓI'

  const handleTalkClick = isListening ? stopListening : startListening

  return (
    <main className="h-dvh max-h-dvh bg-eb-gradient-mobile md:bg-eb-gradient text-white flex flex-col justify-center items-center p-0 md:p-6 lg:p-8 overflow-hidden font-sans">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-6xl h-full md:h-auto md:min-h-0 md:max-h-[92vh] my-auto flex flex-col relative bg-[#0D2745]/90 backdrop-blur-[24px] md:border md:border-white/12 md:border-t-white/60 md:rounded-[24px] md:shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header Block - chung cho cả mobile và desktop */}
        <header className="flex-none pt-4 sm:pt-6 md:pt-5 px-4 sm:px-5 md:px-7 bg-[#0D2745]/70 backdrop-blur-[16px]">
          {/* Top identity bar */}
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/12">
            <div className="flex items-center gap-2">
              <div className="w-[10px] h-[10px] bg-msb-orange rounded-[2px]" />
              <span className="font-bold text-small text-white tracking-[0.02em]">
                MSB
              </span>
              <span className="font-bold text-caption tracking-[0.18em] text-msb-gold">
                BUSINESS
              </span>
              <span className="font-mono text-caption text-white/25 tabular-nums">
                {buildTag()}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="font-semibold text-caption text-white m-0">MR STARK</p>
                <p className="font-normal text-caption tracking-[0.08em] text-white/40 mt-0.5 m-0">
                  CFO · CHECKER 1
                </p>
              </div>
              <div className="w-[28px] h-[28px] rounded-full bg-msb-gold/20 border border-msb-gold/60 flex items-center justify-center font-bold text-caption text-msb-gold">
                S
              </div>
            </div>
          </div>

          {/* Balance strip */}
          <div className="grid grid-cols-[1fr_auto] items-end gap-2.5 py-2.5 sm:py-3 border-b border-white/12">
            <div>
              <p className="font-semibold text-caption tracking-[0.16em] text-white/40 m-0 uppercase">
                SỐ DƯ KHẢ DỤNG · VND
              </p>
              <p className="font-bold text-h3 tracking-[-0.03em] text-white mt-1 sm:mt-1.5 m-0">
                {formatTyRaw(fixtures.balance.availableVnd)}
                <span className="font-semibold text-small tracking-normal text-white/55"> TỶ</span>
              </p>
            </div>
            <div className="text-right pb-0.5">
              <p className="font-bold text-small md:text-body text-signal m-0">
                +{formatTyRaw(fixtures.cashFlow.net)}
              </p>
              <p className="font-normal text-caption text-white/40 mt-0.5 sm:mt-1 m-0 uppercase">
                RÒNG {fixtures.cashFlow.days} NGÀY
              </p>
            </div>
          </div>
        </header>

        {/* ─── MOBILE & TABLET LAYOUT (< lg) ─── */}
        <div className="flex lg:hidden flex-col flex-1 overflow-hidden min-h-0">
          {/* RM Friday Dialogue Strip */}
          <section className="flex-none px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/12 bg-card/85 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
              <div className="w-4 h-4 rounded-full bg-msb-gold/20 border border-msb-gold/60 flex items-center justify-center font-bold text-caption text-msb-gold">
                F
              </div>
              <span className="font-bold text-caption tracking-[0.16em] text-msb-gold uppercase">
                FRIDAY · TRỢ LÝ QHKH DOANH NGHIỆP
              </span>
              <FridayLine />
            </div>
            <FridayText className="font-normal text-caption sm:text-small text-white/90 m-0" />
          </section>

          {/* Main Content Area (Scrollable Widget / Open Prompts) */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 no-scrollbar min-h-0">
            {!activeIntent || activeIntent === 'GREETING' ? (
              <div className="animate-[riseIn_0.3s_ease-out]">
                <p className="font-semibold text-caption tracking-[0.18em] text-white/35 m-0 uppercase">
                  GỢI Ý MỞ PHIÊN
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => void runIntent('CASH_FLOW')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/85 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Tuần này thu chi thế nào?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Dòng tiền →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('RECENT_ACTIONS')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/85 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Có gì chờ anh duyệt không?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Phê duyệt →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('FRAUD_ALERT')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/85 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Có gì bất thường không?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Rủi ro →</span>
                  </button>
                </div>
              </div>
            ) : (
              <WidgetHost />
            )}
          </div>

          {/* Bottom Control Bar */}
          <footer className="flex-none border-t border-white/12 bg-[#0D2745]/90 backdrop-blur-md">
            <ChipBar onSelect={(id) => void runIntent(id)} />

            <div className="flex items-stretch gap-2.5 sm:gap-3 px-4 sm:px-5 pt-2 sm:pt-3 pb-3 sm:pb-4">
              <button
                type="button"
                onClick={handleTalkClick}
                className="flex-1 flex items-center justify-between gap-2.5 p-3 sm:p-3.5 px-4 sm:px-5 btn-primary-msb shadow-[0_4px_16px_rgba(244,96,12,0.35)] cursor-pointer text-left font-semibold text-caption tracking-[0.08em] uppercase transition-all"
              >
                <span>{talkButtonText}</span>
                <span className="flex items-end gap-0.5 h-3.5">
                  <i className="w-[2.5px] h-[40%] bg-white/85 rounded-full" />
                  <i className="w-[2.5px] h-[75%] bg-white/85 rounded-full" />
                  <i className="w-[2.5px] h-full bg-white rounded-full" />
                  <i className="w-[2.5px] h-[60%] bg-white/85 rounded-full" />
                  <i className="w-[2.5px] h-[30%] bg-white/85 rounded-full" />
                </span>
              </button>

              <div className="w-[74px] flex flex-col justify-center items-end border-l border-white/12 pl-2.5 sm:pl-3">
                <p className="font-bold text-small text-signal m-0">
                  {lastLatencyMs !== null ? `${lastLatencyMs}ms` : '—'}
                </p>
                <p className="font-normal text-caption tracking-[0.08em] text-white/35 mt-1 m-0 uppercase">
                  TO-FIRST-AUDIO
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* ─── DESKTOP 2-COLUMN LAYOUT (>= lg) ─── */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          {/* Left Column: Cockpit controls, dialogue & prompt suggestions */}
          <div className="w-[380px] lg:w-[410px] flex-none flex flex-col justify-between border-r border-white/12 bg-sapphire/60 backdrop-blur-md overflow-y-auto no-scrollbar">
            <div>
              {/* Dialogue Box */}
              <div className="p-5 border-b border-white/12 bg-card/75 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-msb-gold/20 border border-msb-gold/60 flex items-center justify-center font-bold text-caption text-msb-gold">
                    F
                  </div>
                  <span className="font-bold text-caption tracking-[0.16em] text-msb-gold uppercase">
                    FRIDAY · TRỢ LÝ QHKH DOANH NGHIỆP
                  </span>
                  <FridayLine />
                </div>
                <FridayText className="font-normal text-small text-white/90 m-0" />
              </div>

              {/* Quick Prompts */}
              <div className="p-5">
                <p className="font-semibold text-caption tracking-[0.18em] text-white/35 m-0 uppercase">
                  GỢI Ý LỆNH GIỌNG NÓI NHANH
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => void runIntent('CASH_FLOW')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/80 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Tuần này thu chi thế nào?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Dòng tiền →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('RECENT_ACTIONS')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/80 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Có gì chờ anh duyệt không?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Phê duyệt →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('FRAUD_ALERT')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/80 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Có gì bất thường không?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Rủi ro →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('SUGGEST_CCTG')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/80 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Tiền nhàn rỗi nên làm gì?”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Tư vấn CCTG →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('TRADE_FINANCE')}
                    className="w-full flex justify-between items-center gap-2.5 p-3 rounded-[8px] bg-card/60 hover:bg-card/90 border border-white/10 hover:border-msb-gold/40 text-small text-white/80 hover:text-white text-left cursor-pointer transition-all"
                  >
                    <span className="font-medium">“Kiểm tra hạn mức L/C và bảo lãnh”</span>
                    <span className="font-normal text-caption text-white/40 shrink-0">Thương mại →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Desktop */}
            <div className="border-t border-white/12 bg-[#0D2745]/90 backdrop-blur-md pb-5 pt-1">
              <div className="mb-3">
                <ChipBar onSelect={(id) => void runIntent(id)} />
              </div>

              <div className="flex items-stretch gap-3 px-5">
                <button
                  type="button"
                  onClick={handleTalkClick}
                  className="flex-1 flex items-center justify-between gap-2.5 p-3.5 px-5 btn-primary-msb shadow-[0_4px_16px_rgba(244,96,12,0.35)] cursor-pointer text-left font-semibold text-caption tracking-[0.08em] uppercase transition-all"
                >
                  <span>{talkButtonText}</span>
                  <span className="flex items-end gap-0.5 h-3.5">
                    <i className="w-[2.5px] h-[40%] bg-white/85 rounded-full" />
                    <i className="w-[2.5px] h-[75%] bg-white/85 rounded-full" />
                    <i className="w-[2.5px] h-full bg-white rounded-full" />
                    <i className="w-[2.5px] h-[60%] bg-white/85 rounded-full" />
                    <i className="w-[2.5px] h-[30%] bg-white/85 rounded-full" />
                  </span>
                </button>

                <div className="w-[80px] flex flex-col justify-center items-end border-l border-white/12 pl-3">
                  <p className="font-bold text-small text-signal m-0">
                    {lastLatencyMs !== null ? `${lastLatencyMs}ms` : '—'}
                  </p>
                  <p className="font-normal text-caption tracking-[0.08em] text-white/35 mt-1 m-0 uppercase">
                    TO-FIRST-AUDIO
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Widget Canvas */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 bg-[#090E17]/60 backdrop-blur-md no-scrollbar">
            {!activeIntent || activeIntent === 'GREETING' ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 card-glass">
                <div className="w-12 h-12 rounded-full bg-msb-gold/15 border border-msb-gold/60 flex items-center justify-center font-bold text-title text-msb-gold mb-4">
                  F
                </div>
                <h3 className="font-bold text-h3 text-white m-0 tracking-tight">
                  Chào mừng Mr Stark đến với MSB Business
                </h3>
                <p className="mt-3 max-w-lg font-normal text-small text-white/70">
                  Em là Friday, Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh. Anh có thể ra lệnh bằng giọng nói tiếng Việt bằng cách bấm <span className="text-msb-orange font-semibold">CHẠM ĐỂ NÓI</span> hoặc chọn nhanh các lệnh nghiệp vụ ở bảng điều khiển bên trái.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => void runIntent('CASH_FLOW')}
                    className="p-3 bg-card/80 hover:bg-card border border-white/12 hover:border-msb-gold/50 rounded-[8px] text-left font-medium text-caption text-white/90 cursor-pointer transition-all"
                  >
                    Dòng tiền 7 ngày →
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('RECENT_ACTIONS')}
                    className="p-3 bg-card/80 hover:bg-card border border-white/12 hover:border-msb-gold/50 rounded-[8px] text-left font-medium text-caption text-white/90 cursor-pointer transition-all"
                  >
                    Lệnh chờ phê duyệt →
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('TRADE_FINANCE')}
                    className="p-3 bg-card/80 hover:bg-card border border-white/12 hover:border-msb-gold/50 rounded-[8px] text-left font-medium text-caption text-white/90 cursor-pointer transition-all"
                  >
                    Hạn mức L/C &amp; Bảo lãnh →
                  </button>
                  <button
                    type="button"
                    onClick={() => void runIntent('SUGGEST_CCTG')}
                    className="p-3 bg-card/80 hover:bg-card border border-white/12 hover:border-msb-gold/50 rounded-[8px] text-left font-medium text-caption text-white/90 cursor-pointer transition-all"
                  >
                    Tối ưu tiền nhàn rỗi (CCTG) →
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl mx-auto">
                <WidgetHost />
              </div>
            )}
          </div>
        </div>

        {/* Overlays */}
        <Orb onCancel={cancelListening} onStop={stopListening} />
        <Drawer onSelect={(id) => void runIntent(id)} />
        <FidoModal />
      </div>
    </main>
  )
}
