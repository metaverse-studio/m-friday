'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { unlockAudio } from '@/lib/audio/player'
import { buildTag } from '@/lib/build-info'
import { useStandalone } from '@/lib/useStandalone'
import { authenticate, hasPlatformAuthenticator } from '@/lib/fido'
import { initFingerprint } from '@/lib/fingerprint'
import { useSession } from '@/lib/session'

export function LockScreen() {
  const unlock = useSession((s) => s.unlock)
  const setInstallPromptOpen = useSession((s) => s.setInstallPromptOpen)
  const standalone = useStandalone()
  const [scanning, setScanning] = useState(false)
  const [lockHint, setLockHint] = useState('Nhận diện tài khoản doanh nghiệp — sẵn sàng xác thực.')
  // Dò trước khi khách chạm: gọi trong handler là tiêu user gesture của Safari
  const canBiometric = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    void hasPlatformAuthenticator().then((ok) => {
      canBiometric.current = ok
    })
    void initFingerprint()
  }, [])

  function handleAuthenticate() {
    // Cả ba lệnh dưới PHẢI nằm trong user gesture này, và KHÔNG được có
    // `await` nào chen vào trước chúng. Tách ra chỗ khác là demo sẽ câm trên
    // iOS, còn WebAuthn thì ném NotAllowedError.
    unlockAudio()
    void navigator.mediaDevices?.getUserMedia({ audio: true }).catch(() => {})
    const auth = authenticate(canBiometric.current)

    setScanning(true)
    setLockHint('Đang xác thực sinh trắc học…')

    /**
     * Mở khóa KHÔNG được phụ thuộc vào việc khách bấm xong Face ID.
     * WebAuthn để timeout 60s cho hộp thoại sinh trắc học có đủ thời gian
     * sống, nhưng nếu chờ đúng promise đó thì màn hình khóa đứng cả phút khi
     * khách bỏ qua — trên sân khấu là chết. Chờ tối đa 10s rồi đi tiếp; xác
     * thực xong sớm hơn thì mở sớm hơn.
     */
    const toiThieu = new Promise((resolve) => setTimeout(resolve, 1500))
    const choToiDa = new Promise((resolve) => setTimeout(resolve, 10_000))
    void Promise.all([toiThieu, Promise.race([auth, choToiDa])]).then(() => {
      setScanning(false)
      unlock()
    })
  }

  return (
    <main className="h-dvh max-h-dvh bg-eb-gradient-mobile md:bg-eb-gradient text-white flex flex-col justify-center items-center p-0 sm:p-4 md:p-6 overflow-hidden font-sans">
      <div className="w-full max-w-md md:max-w-[480px] h-full sm:h-auto sm:min-h-0 sm:max-h-[92vh] my-auto flex flex-col justify-between p-5 pt-6 pb-6 sm:p-6 md:p-8 md:border md:border-white/12 md:border-t-white/60 md:rounded-[24px] md:bg-[#13161B]/95 md:backdrop-blur-[24px] md:shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-y-auto no-scrollbar">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/12 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-[10px] h-[10px] bg-msb-orange rounded-[2px]" />
                <span className="font-bold text-body tracking-[0.02em] text-white">
                  MSB
                </span>
                <span className="font-semibold text-body tracking-[0.02em] text-white/50">
                  BUSINESS
                </span>
              </div>
              <p className="mt-1.5 font-bold text-caption tracking-[0.22em] text-msb-gold">
                CORPORATE · PRIORITY
              </p>
            </div>
            <p className="font-normal text-caption text-right text-white/40">
              PHIÊN TRÌNH DIỄN
              <span className="block font-mono text-white/30 tabular-nums">{buildTag()}</span>
            </p>
          </div>

          {/* Account information */}
          <div className="pt-4 sm:pt-6">
            <p className="font-semibold text-caption tracking-[0.16em] uppercase text-white/40">
              Tài khoản doanh nghiệp
            </p>
            <h2 className="mt-2 font-bold text-title sm:text-h3 tracking-[-0.02em] text-white">
              Stark Industry
            </h2>
            <p className="mt-2 font-normal text-caption text-white/50">
              VND · 0210 4567 8901 · USD · 0210 9988 7766
            </p>
          </div>
        </div>

        {/* Center Scanner */}
        <div className="my-auto py-3 sm:py-6 flex items-center justify-center">
          <div className="relative w-[140px] h-[140px] sm:w-[168px] sm:h-[168px] md:w-[184px] md:h-[184px] flex items-center justify-center">
            {/* Outer static box */}
            <div className="absolute inset-0 border border-msb-gold/30 rounded-[16px]" />

            {/* Scanning radar square animation */}
            {scanning && (
              <>
                <div className="absolute inset-0 border-2 border-msb-gold rounded-[16px] animate-[scanRing_1.2s_ease-out_infinite]" />
                <div className="absolute left-2 right-2 h-[2px] bg-msb-gold shadow-[0_0_18px_2px_rgba(190,154,97,0.7)] animate-[scanLine_1.1s_ease-in-out_infinite_alternate]" />
              </>
            )}

            {/* Inner box */}
            <div className="absolute inset-[20px] sm:inset-[24px] bg-card/85 rounded-[12px] border border-msb-gold/35 backdrop-blur-sm" />

            {/* Fingerprint SVG */}
            <svg
              width="58"
              height="58"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BE9A61"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="relative w-12 h-12 sm:w-[58px] sm:h-[58px]"
            >
              <path d="M12 4.5c-3.6 0-6.5 2.6-6.5 5.8 0 1.2.2 2.4.6 3.5" />
              <path d="M12 7.4c-2 0-3.6 1.5-3.6 3.3 0 2.3.5 4.4 1.4 6.3" />
              <path d="M12 10.3c-.6 0-1 .5-1 1.1 0 2.7.6 5.3 1.6 7.6" />
              <path d="M12 4.5c3.6 0 6.5 2.6 6.5 5.8 0 3-.6 5.9-1.8 8.5" />
              <path d="M12 7.4c2 0 3.6 1.5 3.6 3.3 0 2.6-.5 5.1-1.5 7.4" />
            </svg>
          </div>
        </div>

        {/* Action Button & Hints */}
        <div>
          <p className="mb-3 sm:mb-4 font-normal text-caption text-white/60 min-h-[32px] sm:min-h-[36px] text-center">
            {lockHint}
          </p>

          <button
            type="button"
            onClick={handleAuthenticate}
            disabled={scanning}
            className="w-full flex items-center justify-between gap-3 p-3.5 sm:p-4 px-5 btn-primary-msb text-[#13161B] shadow-[0_4px_16px_rgba(190,154,97,0.35)] cursor-pointer disabled:opacity-80 font-bold text-caption sm:text-small tracking-[0.08em] uppercase transition-all"
          >
            <span>XÁC THỰC FIDO BIOMETRIC</span>
            <span className="font-bold text-small">→</span>
          </button>

          {!standalone && (
          <button
            type="button"
            onClick={() => setInstallPromptOpen(true)}
            className="mt-2.5 sm:mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] border border-white/15 bg-white/[0.04] text-white/70 cursor-pointer font-semibold text-caption tracking-[0.08em] uppercase transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cài lên màn hình chính</span>
          </button>
          )}
        </div>
      </div>
    </main>
  )
}
