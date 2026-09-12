import { getCached, putCached, type CachedAudio } from './cache'

const MAX_CHUNK_LENGTH = 90

let audioContext: AudioContext | null = null
let currentCleanup: (() => void) | null = null
let playToken = 0

/** WAV im lặng dài 0 giây, chỉ để "mồi" thẻ audio trong user gesture */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA='

/**
 * Một thẻ audio duy nhất, dùng lại cho mọi mảnh thoại.
 *
 * iOS cấp quyền phát cho TỪNG phần tử audio, không cấp cho cả trang. Một thẻ
 * `new Audio()` vừa khởi tạo ngoài user gesture sẽ bị chặn ngay khi gọi play()
 * — nên cách duy nhất chạy được là mồi đúng một thẻ trong lúc khách chạm nút,
 * rồi về sau chỉ đổi `src` trên chính thẻ đó.
 */
let sharedAudio: HTMLAudioElement | null = null

/**
 * PHẢI gọi bên trong một user gesture (ví dụ handler của nút đăng nhập).
 * iOS Safari chặn mọi lần phát audio sau đó nếu bước này bị bỏ qua.
 */
export function unlockAudio(): void {
  if (!sharedAudio) {
    try {
      sharedAudio = new Audio()
      sharedAudio.preload = 'auto'
      sharedAudio.setAttribute('playsinline', '')
      sharedAudio.hidden = true
      // Gắn vào DOM: iOS phát ổn định hơn với phần tử thật, và nhờ đó soi
      // được trạng thái thẻ bằng Web Inspector khi cần gỡ lỗi
      document.body.appendChild(sharedAudio)
      // Giữ nguyên thẻ này mãi mãi: mất nó là mất quyền phát trên iOS
      sharedAudio.src = SILENT_WAV
      void sharedAudio.play().catch((error) => {
        console.warn('[audio] mồi thẻ audio thất bại:', error)
      })
    } catch (error) {
      console.error('[audio] không tạo được thẻ audio:', error)
    }
  }

  if (audioContext) {
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
    return
  }
  try {
    audioContext = new AudioContext()
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
    const silent = audioContext.createBuffer(1, 1, 22_050)
    const source = audioContext.createBufferSource()
    source.buffer = silent
    source.connect(audioContext.destination)
    source.start(0)
  } catch (error) {
    console.error('[audio] mở khóa thất bại:', error)
  }
}

/**
 * Cắt lời thoại thành mảnh đủ ngắn để tổng hợp nhanh.
 * Ưu tiên dấu chấm, xuống dấu phẩy khi mảnh vẫn quá dài.
 * Không cắt ở dấu phẩy nằm giữa hai chữ số (18,2).
 */
export function splitSentences(text: string): string[] {
  const bySentence = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const result: string[] = []
  for (const sentence of bySentence) {
    if (sentence.length <= MAX_CHUNK_LENGTH) {
      result.push(sentence)
      continue
    }
    const byComma = sentence
      .split(/(?<=\D),\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
    result.push(...byComma)
  }
  return result
}

async function fetchAudio(text: string, lockedVoice?: string): Promise<CachedAudio | null> {
  const cached = await getCached(text)
  // Mảnh trong cache nhưng sai giọng của lượt này thì phải tổng hợp lại
  if (cached && (!lockedVoice || cached.voice === lockedVoice)) return cached

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: lockedVoice }),
    })
    if (!response.ok || response.status === 204) return null

    const voice = decodeURIComponent(response.headers.get('X-Tts-Voice') || '')
    const blob = await response.blob()
    if (blob.size < 500 || !voice) return null
    if (lockedVoice && voice !== lockedVoice) return null

    void putCached(text, blob, voice)
    return { blob, voice }
  } catch (error) {
    console.error('[audio] tải tts thất bại:', error)
    return null
  }
}

function playBlob(blob: Blob, token: number): Promise<void> {
  return new Promise((resolve) => {
    if (token !== playToken) return resolve()

    // Chưa có thẻ đã mồi tức là unlockAudio() không chạy trong user gesture.
    // Tạo thẻ mới ở đây thì iOS chặn, nhưng desktop vẫn phát được.
    if (!sharedAudio) {
      console.warn('[audio] chưa mồi thẻ audio, iOS sẽ chặn lần phát này')
      sharedAudio = new Audio()
    }
    const audio = sharedAudio

    const url = URL.createObjectURL(blob)

    let settled = false
    const cleanup = () => {
      if (settled) return
      settled = true
      audio.onended = null
      audio.onerror = null
      URL.revokeObjectURL(url)
      if (currentCleanup === cleanup) currentCleanup = null
      resolve()
    }

    currentCleanup = cleanup
    audio.onended = cleanup
    audio.onerror = cleanup
    audio.src = url
    void audio.play().catch((error) => {
      console.error('[audio] play bị chặn:', error)
      cleanup()
    })
  })
}

/**
 * Phát lời thoại theo mảnh. Mảnh nói được đầu tiên chốt giọng cho cả lượt,
 * rồi các mảnh sau mới tải nền song song trong lúc mảnh đầu đang phát.
 * Mảnh nào không ra đúng giọng đã chốt thì bị bỏ — thà thiếu một vế còn hơn
 * phát một câu trả lời bằng hai giọng khác nhau.
 * onFirstAudio bắn đúng một lần, dùng để đo time-to-first-audio.
 */
export async function speak(
  text: string,
  onFirstAudio?: () => void,
  fallbackUrl?: string,
): Promise<void> {
  stopSpeaking()
  const token = ++playToken

  const chunks = splitSentences(text)
  if (chunks.length === 0) return

  let announced = false
  let lockedVoice: string | undefined
  const pending: (Promise<CachedAudio | null> | undefined)[] = []

  for (let i = 0; i < chunks.length; i++) {
    if (token !== playToken) return

    const audio = await (pending[i] ?? fetchAudio(chunks[i]!, lockedVoice))
    if (!audio) continue

    if (!lockedVoice) {
      // Mảnh nói được đầu tiên chốt giọng cho cả lượt. Chỉ sau khi chốt mới
      // bắn phần còn lại một lượt — trước đây bắn hết ngay từ đầu nên API
      // nhận cả chùm request, những mảnh sau bị rate-limit rồi rơi giọng.
      lockedVoice = audio.voice
      for (let j = i + 1; j < chunks.length; j++) {
        pending[j] = fetchAudio(chunks[j]!, lockedVoice)
      }
    }

    if (!announced) {
      announced = true
      onFirstAudio?.()
    }
    await playBlob(audio.blob, token)
  }

  // Không mảnh nào tổng hợp được — dùng MP3 dựng sẵn
  if (!announced && fallbackUrl) {
    try {
      const response = await fetch(fallbackUrl)
      if (response.ok) {
        announced = true
        onFirstAudio?.()
        await playBlob(await response.blob(), token)
      }
    } catch (error) {
      console.error('[audio] mp3 dự phòng cũng thất bại:', error)
    }
  }

  // Nếu hoàn toàn không phát được âm thanh thực tế, đảm bảo kích hoạt onFirstAudio và giữ nhịp thoại 2.5s
  if (!announced && token === playToken) {
    onFirstAudio?.()
    await new Promise((resolve) => setTimeout(resolve, 2500))
  }
}

/** Barge-in: người dùng chạm orb để ngắt lời RM */
export function stopSpeaking(): void {
  playToken++
  if (sharedAudio) {
    sharedAudio.pause()
    // Không gán src = '' hay gọi load(): trên iOS thao tác đó thu lại quyền
    // phát của thẻ, lần sau muốn nói lại phải có user gesture mới
    try {
      sharedAudio.currentTime = 0
    } catch {}
  }
  // pause() không bắn onended, phải tự giải phóng lời hứa và object URL
  currentCleanup?.()
}

export function fallbackUrlFor(intentId: string): string {
  return `/audio/fallback/${intentId}.mp3`
}
