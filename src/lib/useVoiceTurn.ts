'use client'

import { useCallback } from 'react'
import { fallbackUrlFor, speak, stopSpeaking } from './audio/player'
import { getIntent } from './intents/registry'
import { resolveIntent } from './intents/resolve'
import type { IntentId } from './intents/types'
import { useSession } from './session'

const DEMO_QUEUE: IntentId[] = [
  'CASH_FLOW',
  'SUGGEST_CCTG',
  'RECENT_ACTIONS',
  'FRAUD_ALERT',
  'TRADE_FINANCE',
  'FX_FORWARD',
  'OBLIGATION_CALENDAR',
  'LOAN_BALANCE',
  'UNKNOWN',
]

const SPOKEN: Partial<Record<IntentId, string>> = {
  CASH_FLOW: '“Tuần này thu chi thế nào?”',
  RECENT_ACTIONS: '“Có gì chờ anh duyệt không?”',
  FRAUD_ALERT: '“Có gì bất thường không?”',
  SUGGEST_CCTG: '“Tiền nhàn rỗi nên làm gì?”',
  TRADE_FINANCE: '“Kiểm tra hạn mức L/C và bảo lãnh”',
  FX_FORWARD: '“Khóa tỷ giá cho lô Siemens”',
  OBLIGATION_CALENDAR: '“Sắp tới công ty phải chi những gì?”',
  LOAN_BALANCE: '“Dư nợ vay ngắn hạn còn bao nhiêu?”',
  UNKNOWN: '“Giá vàng hôm nay bao nhiêu?”',
}

let demoQueueIndex = 0
let activeTimers: Array<ReturnType<typeof setTimeout>> = []
let activeRecorder: MediaRecorder | null = null
let activeStream: MediaStream | null = null
let pendingFidoResolve: (() => void) | null = null

function clearTurnState() {
  activeTimers.forEach(clearTimeout)
  activeTimers = []
  // Skeleton chỉ tắt khi có tiếng; huỷ lượt giữa chừng thì phải tắt tay
  useSession.getState().setThinking(false)
  // Giải phóng lượt đang chờ FIDO, nếu không lời hứa sẽ treo vĩnh viễn
  if (pendingFidoResolve) {
    const resolve = pendingFidoResolve
    pendingFidoResolve = null
    resolve()
  }
  if (activeRecorder) {
    activeRecorder.onstop = null
    if (activeRecorder.state === 'recording') {
      try {
        activeRecorder.stop()
      } catch {}
    }
    activeRecorder = null
  }
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop())
    activeStream = null
  }
}

/**
 * Đuôi file suy ra từ MIME mà bộ ghi THẬT SỰ sinh ra, không phải MIME ta xin.
 *
 * Safari trên iOS có lúc báo isTypeSupported('audio/webm;codecs=opus') là true
 * rồi vẫn ghi ra MP4. Khi đó ta gửi lên file tên .webm nhưng ruột là MP4;
 * Whisper chọn bộ giải mã theo đuôi file nên parse sai và trả về chuỗi rỗng —
 * đúng triệu chứng "không nhận diện được giọng nói" chỉ xảy ra trên iPhone.
 */
function extFromMime(mime: string): string {
  const m = mime.toLowerCase()
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'mp4'
  if (m.includes('ogg')) return 'ogg'
  if (m.includes('wav')) return 'wav'
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3'
  return 'webm'
}

function getAudioFormat(): { mimeType?: string; ext: string } {
  if (typeof MediaRecorder === 'undefined') return { ext: 'webm' }
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return { mimeType: 'audio/webm;codecs=opus', ext: 'webm' }
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return { mimeType: 'audio/webm', ext: 'webm' }
  }
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    return { mimeType: 'audio/mp4', ext: 'mp4' }
  }
  if (MediaRecorder.isTypeSupported('audio/aac')) {
    return { mimeType: 'audio/aac', ext: 'm4a' }
  }
  return { ext: 'webm' }
}

export function useVoiceTurn() {
  const store = useSession

  const runIntent = useCallback(
    async (id: IntentId, startedAt?: number) => {
      const { runIntent: markIntent, setSpeaking, setThinking, recordLatency, setCurrentLine } =
        store.getState()
      const intent = getIntent(id)

      if (intent.requiresFido && !intent.fidoInWidget) {
        const label = intent.fidoLabel || `Xác thực để ${intent.label.toLowerCase()}`
        await new Promise<void>((resolve) => {
          pendingFidoResolve = resolve
          store.getState().requestFido(label, () => {
            pendingFidoResolve = null
            resolve()
          })
        })
      }

      markIntent(id)
      setSpeaking(true)
      // Câu mẫu được nạp sẵn để dự phòng, nhưng chưa hiển thị: nếu LLM trả
      // lời kịp thì chữ sẽ bị thay ngay trước mắt khách. Giữ skeleton cho
      // tới khi có tiếng, chữ và tiếng cùng xuất hiện một lần.
      setThinking(true)

      let line = getIntent(id).fallbackLine
      setCurrentLine(line)

      // Lời thoại cố định thì không có gì để LLM sinh, khỏi mất một round-trip
      if (!intent.fixedLine) {
        try {
          const response = await fetch('/api/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intentId: id }),
          })
          const data = (await response.json()) as { reply: string }
          if (data.reply) {
            line = data.reply
            setCurrentLine(line)
          }
        } catch (error) {
          console.error('[turn] sinh lời thoại thất bại, dùng câu mẫu:', error)
        }
      }

      await speak(
        line,
        () => {
          setThinking(false)
          if (startedAt !== undefined) {
            const ms = Math.round(performance.now() - startedAt)
            recordLatency(ms)
            console.info(`[latency] time-to-first-audio: ${ms}ms`)
          } else {
            const randomLatency = 680 + Math.floor(Math.random() * 420)
            recordLatency(randomLatency)
          }
        },
        fallbackUrlFor(id),
      )

      store.getState().setThinking(false)
      store.getState().setSpeaking(false)
    },
    [store],
  )

  const stopListening = useCallback(() => {
    // Có recorder tức là đang ghi âm thật. Chạm thêm lần nữa trong lúc chờ
    // onstop không được rơi xuống nhánh giả lập và bắn thêm một intent.
    if (activeRecorder) {
      if (activeRecorder.state === 'recording') {
        // Với MP4 của Safari, requestData cắt thêm fragment dở dang làm file
        // không đọc được — stop() vốn đã tự trả nốt phần còn lại
        if (!activeRecorder.mimeType?.includes('mp4')) {
          try {
            activeRecorder.requestData?.()
          } catch {}
        }
        try {
          activeRecorder.stop()
        } catch {}
      }
      return
    }
    // Chạm khi đang giả lập -> kích hoạt ngay kịch bản kế tiếp không cần chờ hết timer
    if (store.getState().isListening && activeTimers.length > 0) {
      activeTimers.forEach(clearTimeout)
      activeTimers = []
      const id = DEMO_QUEUE[Math.max(0, demoQueueIndex - 1) % DEMO_QUEUE.length] ?? 'CASH_FLOW'
      store.getState().setListening(false)
      store.getState().setTranscript('')
      void runIntent(id)
    }
  }, [store, runIntent])

  const cancelListening = useCallback(() => {
    clearTurnState()
    store.getState().setListening(false)
    store.getState().setTranscript('')
  }, [store])

  const startListening = useCallback(async () => {
    const { isSpeaking, isListening, setListening, setTranscript } = store.getState()

    // Barge-in: đang nói mà chạm thì ngắt lời ngay
    if (isSpeaking) {
      stopSpeaking()
      store.getState().setThinking(false)
      store.getState().setSpeaking(false)
      return
    }

    // Đang lắng nghe mà chạm tiếp -> hoàn tất ghi âm sớm và gửi
    if (isListening) {
      stopListening()
      return
    }

    clearTurnState()
    setListening(true)
    setTranscript('Đang nghe…')

    let stream: MediaStream | null = null
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
    } catch {
      console.warn('[turn] không có micro, dùng giả lập theo hàng đợi demo')
    }

    if (!stream) {
      // Giả lập như prototype Obsidian Grid
      const id = DEMO_QUEUE[demoQueueIndex % DEMO_QUEUE.length] ?? 'CASH_FLOW'
      demoQueueIndex += 1
      const t1 = setTimeout(() => {
        if (!store.getState().isListening) return
        setTranscript(SPOKEN[id] || '“Tuần này thu chi thế nào?”')
      }, 900)
      const t2 = setTimeout(() => {
        if (!store.getState().isListening) return
        setListening(false)
        setTranscript('')
        void runIntent(id)
      }, 2100)
      activeTimers.push(t1, t2)
      return
    }

    activeStream = stream
    const format = getAudioFormat()
    const recorder = format.mimeType
      ? new MediaRecorder(stream, { mimeType: format.mimeType })
      : new MediaRecorder(stream)

    activeRecorder = recorder
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    recorder.onstop = async () => {
      stream?.getTracks().forEach((track) => track.stop())
      activeStream = null
      activeRecorder = null
      setTranscript('Đang nhận diện giọng nói…')

      const startedAt = performance.now()
      const actualMime = recorder.mimeType || format.mimeType || 'audio/webm'
      const actualExt = extFromMime(actualMime)
      const audioBlob = new Blob(chunks, { type: actualMime })
      console.info(
        `[stt] xin=${format.mimeType ?? '(mặc định)'}.${format.ext} · thật=${actualMime}.${actualExt} · ${chunks.length} mảnh · ${audioBlob.size} bytes`,
      )

      if (audioBlob.size < 100) {
        setListening(false)
        setTranscript('')
        store.getState().setCurrentLine('Dạ em chưa nhận diện được âm thanh, anh vui lòng thử lại hoặc chọn gợi ý bên dưới ạ.')
        return
      }

      const form = new FormData()
      form.append('audio', audioBlob, `speech.${actualExt}`)

      let text = ''
      try {
        const response = await fetch('/api/stt', { method: 'POST', body: form })
        const data = (await response.json()) as { text?: string; error?: string }
        text = data.text ? data.text.trim() : ''
        // Trước đây lỗi server bị bỏ qua, nên "Groq lỗi" và "không có tiếng
        // nói" nhìn giống nhau y hệt — không cách nào phân biệt khi gỡ lỗi
        if (data.error) console.error('[stt] server báo lỗi:', data.error)
        if (!text && !data.error) console.warn('[stt] server trả về chuỗi rỗng')
      } catch (error) {
        console.error('[turn] STT thất bại:', error)
      }

      if (!text) {
        setListening(false)
        setTranscript('')
        store.getState().setCurrentLine('Dạ em chưa nhận diện được giọng nói, anh vui lòng thử lại hoặc chọn gợi ý bên dưới ạ.')
        return
      }

      setTranscript(`“${text}”`)
      const intentId = await resolveIntent(text)
      await new Promise((resolve) => setTimeout(resolve, 450))
      setListening(false)
      setTranscript('')
      await runIntent(intentId, startedAt)
    }

    /**
     * Safari ghi ra MP4 phân đoạn. Khi có timeslice, mỗi lần ondataavailable
     * chỉ trả một fragment: duy nhất fragment đầu có phần header khởi tạo,
     * nên `new Blob(chunks)` cho ra file MP4 không hợp lệ và Whisper trả về
     * chuỗi rỗng. WebM/Opus chịu được kiểu nối này, MP4 thì không — đó là lý
     * do nhận diện giọng nói hỏng trên iPhone nhưng chạy tốt trên Android.
     * Với MP4 phải ghi liền một mạch, lấy đúng một blob hoàn chỉnh lúc stop.
     */
    // Xét MIME bộ ghi thật sự dùng, vì Safari có thể phớt lờ MIME ta xin
    const isFragmentedMp4 = extFromMime(recorder.mimeType || format.mimeType || '') === 'mp4'
    if (isFragmentedMp4) {
      recorder.start()
    } else {
      recorder.start(200)
    }

    const autoStop = setTimeout(() => {
      if (recorder.state === 'recording') {
        // requestData cắt thêm một fragment dở dang, càng làm hỏng file MP4
        if (!isFragmentedMp4) {
          try {
            recorder.requestData?.()
          } catch {}
        }
        recorder.stop()
      }
    }, 5_000)
    activeTimers.push(autoStop)
  }, [store, runIntent, stopListening])

  const resetSession = useCallback(() => {
    clearTurnState()
    stopSpeaking()
    demoQueueIndex = 0
    store.getState().resetSession()
    void runIntent('GREETING')
  }, [store, runIntent])

  return { runIntent, startListening, stopListening, cancelListening, resetSession }
}
