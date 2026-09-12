import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

/**
 * `voice` là mã định danh giọng THẬT đã tạo ra buffer này, không phải giọng
 * được yêu cầu. Một lượt thoại bị cắt thành nhiều mảnh và tổng hợp riêng,
 * nên client phải biết mảnh nào ra giọng nào để không phát lẫn hai giọng
 * trong cùng một câu trả lời.
 */
export type TtsResult = { audio: Buffer; voice: string }

export type TtsProvider = {
  /**
   * `lockedVoice` khóa giọng theo mảnh đầu của lượt. Khi không tổng hợp được
   * đúng giọng đó, trả `null` để client bỏ mảnh — thà thiếu một vế còn hơn
   * đổi giọng giữa câu.
   */
  synthesize(text: string, lockedVoice?: string): Promise<TtsResult | null>
}

export const VOICE_NAME = 'vi-VN-HoaiMyNeural'
export const EDGE_VOICE_ID = `edge:${VOICE_NAME}`
export const MAC_VOICE_ID = 'say:Linh'

const TMP_DIR = join(process.cwd(), '.tmp')

async function synthesizeNativeMac(text: string): Promise<Buffer> {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const tmpAiff = join(TMP_DIR, `tts-${id}.aiff`)
  const tmpMp3 = join(TMP_DIR, `tts-${id}.mp3`)

  try {
    await new Promise<void>((resolve, reject) => {
      const p = spawn('say', ['-v', 'Linh', '-o', tmpAiff, text])
      p.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`say exited with code ${code}`)),
      )
      p.on('error', reject)
    })

    // Thử ffmpeg trước, nếu không có thì thử lame
    let converted = false
    try {
      await new Promise<void>((resolve, reject) => {
        const p = spawn('ffmpeg', ['-y', '-i', tmpAiff, tmpMp3], {
          stdio: ['ignore', 'ignore', 'ignore'],
        })
        p.on('close', (code) =>
          code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)),
        )
        p.on('error', reject)
      })
      converted = true
    } catch {
      // ffmpeg thất bại, thử lame
    }

    if (!converted) {
      await new Promise<void>((resolve, reject) => {
        const p = spawn('lame', [tmpAiff, tmpMp3], {
          stdio: ['ignore', 'ignore', 'ignore'],
        })
        p.on('close', (code) =>
          code === 0 ? resolve() : reject(new Error(`lame exited with code ${code}`)),
        )
        p.on('error', reject)
      })
    }

    return await fs.readFile(tmpMp3)
  } finally {
    await fs.unlink(tmpAiff).catch(() => {})
    await fs.unlink(tmpMp3).catch(() => {})
  }
}

/**
 * Edge-TTS là API không chính thức của Microsoft và có thể bị chặn.
 * Khi bị chặn hoặc môi trường sandbox mock dummy, rơi về macOS say -v Linh
 * theo đúng đặc tả §4.1 để bảo đảm âm thanh thực tế phát được.
 */
export const edgeTts: TtsProvider = {
  async synthesize(text: string, lockedVoice?: string): Promise<TtsResult | null> {
    // Lượt này đã chốt một giọng không thuộc provider nào ở đây
    if (lockedVoice && lockedVoice !== EDGE_VOICE_ID && lockedVoice !== MAC_VOICE_ID) {
      return null
    }

    if (lockedVoice !== MAC_VOICE_ID) {
      try {
        const tts = new MsEdgeTTS()
        await tts.setMetadata(VOICE_NAME, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

        const { audioStream } = tts.toStream(text)
        const chunks: Buffer[] = []

        const result = await new Promise<Buffer>((resolve, reject) => {
          audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
          audioStream.on('end', () => resolve(Buffer.concat(chunks)))
          audioStream.on('error', reject)
        })

        // Buffer thực tế của một câu nói tiếng Việt thường > 1000 bytes.
        // Nếu dưới 500 bytes tức là stub giả lập hoặc stream rỗng, kích hoạt fallback.
        if (result.length >= 500) {
          return { audio: result, voice: EDGE_VOICE_ID }
        }
      } catch {
        // MsEdgeTTS ném lỗi, tiếp tục xuống tầng dưới
      }
    }

    // Giọng đã khóa là edge mà edge vừa chết: rơi xuống `say` là đổi giọng
    if (lockedVoice === EDGE_VOICE_ID) return null

    return { audio: await synthesizeNativeMac(text), voice: MAC_VOICE_ID }
  },
}
