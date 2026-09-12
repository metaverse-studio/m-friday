import type { TtsProvider, TtsResult } from './edge-tts'
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

export function vieneuVoiceId(): string {
  return `vieneu:${process.env.VIENEU_VOICE || DEFAULT_VIENEU_VOICE}`
}

/**
 * Provider tích hợp VieNeu TTS Cloud API (https://api.vieneu.io/api/v1/audio/speech)
 * Tương thích OpenAI audio/speech format, hỗ trợ các giọng tiếng Việt chất lượng cao (v4/v3).
 *
 * Có fallback sang edge-tts, NHƯNG chỉ khi lượt thoại chưa chốt giọng. Fallback
 * giữa lượt là nguyên nhân giọng bị đổi ngay trong một câu trả lời: mỗi mảnh
 * câu là một request riêng, mảnh nào bị 429 hay timeout sẽ về giọng edge.
 */
export const vieneuTts: TtsProvider = {
  async synthesize(text: string, lockedVoice?: string): Promise<TtsResult | null> {
    const voiceId = vieneuVoiceId()

    // Mảnh đầu đã ra giọng edge/say, các mảnh sau phải theo, không gọi VieNeu
    if (lockedVoice && lockedVoice !== voiceId) {
      return edgeTts.synthesize(text, lockedVoice)
    }

    const apiKey = getRandomVieneuApiKey()
    if (!apiKey) {
      if (lockedVoice) return null
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
        // Mảnh sau được tải trong lúc mảnh đầu đang phát nên có dư thời gian;
        // timeout ngắn chỉ làm tăng tỷ lệ rơi provider một cách vô ích.
        signal: AbortSignal.timeout(10_000),
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.error(`[vieneu-tts] API phản hồi lỗi ${response.status}: ${errText}`)
      } else {
        const buffer = Buffer.from(await response.arrayBuffer())
        if (buffer.length >= 500) {
          return { audio: buffer, voice: voiceId }
        }
        console.warn('[vieneu-tts] buffer nhận về quá nhỏ (<500 bytes)')
      }
    } catch (error) {
      console.error('[vieneu-tts] gọi API thất bại:', error)
    }

    // Giọng đã chốt là VieNeu: bỏ mảnh này thay vì phát bằng giọng khác
    if (lockedVoice) {
      console.error('[vieneu-tts] bỏ mảnh để giữ nhất quán giọng', lockedVoice)
      return null
    }
    return edgeTts.synthesize(text)
  },
}
