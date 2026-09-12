import { getCached, putCached } from './cache'

const MAX_CHUNK_LENGTH = 90

let audioContext: AudioContext | null = null
let currentAudio: HTMLAudioElement | null = null
let currentCleanup: (() => void) | null = null
let playToken = 0

/**
 * PHẢI gọi bên trong một user gesture (ví dụ handler của nút đăng nhập).
 * iOS Safari chặn mọi lần phát audio sau đó nếu bước này bị bỏ qua.
 */
export function unlockAudio(): void {
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

async function fetchAudio(text: string): Promise<Blob | null> {
  const cached = await getCached(text)
  if (cached) return cached

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok || response.status === 204) return null

    const blob = await response.blob()
    if (blob.size < 500) return null

    void putCached(text, blob)
    return blob
  } catch (error) {
    console.error('[audio] tải tts thất bại:', error)
    return null
  }
}

function playBlob(blob: Blob, token: number): Promise<void> {
  return new Promise((resolve) => {
    if (token !== playToken) return resolve()

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio

    let settled = false
    const cleanup = () => {
      if (settled) return
      settled = true
      audio.onended = null
      audio.onerror = null
      URL.revokeObjectURL(url)
      if (currentAudio === audio) currentAudio = null
      if (currentCleanup === cleanup) currentCleanup = null
      resolve()
    }

    currentCleanup = cleanup
    audio.onended = cleanup
    audio.onerror = cleanup
    void audio.play().catch((error) => {
      console.error('[audio] play bị chặn:', error)
      cleanup()
    })
  })
}

/**
 * Phát lời thoại theo mảnh. Mảnh đầu được tải và phát ngay,
 * các mảnh sau tải nền song song rồi phát nối tiếp.
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

  const pending = chunks.map((chunk) => fetchAudio(chunk))
  let announced = false

  for (const promise of pending) {
    if (token !== playToken) return
    const blob = await promise
    if (!blob) continue

    if (!announced) {
      announced = true
      onFirstAudio?.()
    }
    await playBlob(blob, token)
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
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
  // pause() không bắn onended, phải tự giải phóng lời hứa và object URL
  currentCleanup?.()
  currentAudio = null
}

export function fallbackUrlFor(intentId: string): string {
  return `/audio/fallback/${intentId}.mp3`
}
