import type { TtsProvider } from './edge-tts'
import { edgeTts } from './edge-tts'

export const DEFAULT_VIENEU_VOICE = 'Ngọc Lan'

export function getVieneuApiKeys(): string[] {
  const raw = process.env.VIENEU_API_KEYS || process.env.VIENEU_API_KEY || ''
  return raw
    .split(/[\s,;]+/)
    .map((k) => k.trim())
    .filter(Boolean)
}

export function getRandomVieneuApiKey(): string {
  const keys = getVieneuApiKeys()
  if (keys.length === 0) return ''
  const index = Math.floor(Math.random() * keys.length)
  return keys[index] ?? ''
}

/**
 * Provider tích hợp VieNeu TTS Cloud API (https://api.vieneu.io/api/v1/audio/speech)
 * Tương thích OpenAI audio/speech format, hỗ trợ các giọng tiếng Việt chất lượng cao (v4/v3).
 * Có fallback tự động sang edge-tts khi không có API key hoặc kết nối bị gián đoạn.
 */
export const vieneuTts: TtsProvider = {
  async synthesize(text: string): Promise<Buffer> {
    const apiKey = getRandomVieneuApiKey()
    if (!apiKey) {
      console.warn('[vieneu-tts] VIENEU_API_KEY chưa cấu hình, rơi về edge-tts')
      return edgeTts.synthesize(text)
    }

    const voice = process.env.VIENEU_VOICE || DEFAULT_VIENEU_VOICE

    try {
      const response = await fetch('https://api.vieneu.io/api/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          voice,
          response_format: 'mp3',
        }),
        signal: AbortSignal.timeout(4000),
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.error(`[vieneu-tts] API phản hồi lỗi ${response.status}: ${errText}`)
        return edgeTts.synthesize(text)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      if (buffer.length >= 500) {
        return buffer
      }
      console.warn('[vieneu-tts] buffer nhận về quá nhỏ (<500 bytes), rơi về edge-tts')
    } catch (error) {
      console.error('[vieneu-tts] gọi API thất bại:', error)
    }

    return edgeTts.synthesize(text)
  },
}
