import { describe, expect, test } from 'bun:test'
import { getTtsProvider } from './index'
import { vieneuTts, vieneuVoiceId } from './vieneu-tts'
import { edgeTts } from './edge-tts'

describe('VieNeu TTS Provider', () => {
  test('getTtsProvider trả về đúng instance theo biến môi trường', () => {
    const oldEnv = process.env.TTS_PROVIDER
    try {
      process.env.TTS_PROVIDER = 'vieneu'
      expect(getTtsProvider()).toBe(vieneuTts)

      process.env.TTS_PROVIDER = 'edge-tts'
      expect(getTtsProvider()).toBe(edgeTts)

      delete process.env.TTS_PROVIDER
      expect(getTtsProvider()).toBe(edgeTts)
    } finally {
      process.env.TTS_PROVIDER = oldEnv
    }
  })

  test('vieneuTts.synthesize tạo buffer âm thanh thực tế (> 500 bytes)', async () => {
    const result = await vieneuTts.synthesize('Xin chào Mr Stark.')
    expect(result).not.toBeNull()
    expect(result!.audio).toBeInstanceOf(Buffer)
    expect(result!.audio.length).toBeGreaterThan(500)
  }, 20_000)

  test('vieneuTts.synthesize câu tiếng Việt dài hoàn thành tốt', async () => {
    const line =
      'Báo cáo Mr Stark, trong 7 ngày qua dòng tiền doanh nghiệp thặng dư ròng 18,2 tỷ VNĐ ạ.'
    const result = await vieneuTts.synthesize(line)
    expect(result!.audio).toBeInstanceOf(Buffer)
    expect(result!.audio.length).toBeGreaterThan(1000)
  }, 20_000)

  /**
   * Lỗi gốc: mỗi mảnh câu là một request riêng, mảnh nào lỗi thì âm thầm
   * rơi sang giọng edge, nên một câu trả lời phát ra bằng hai giọng.
   */
  test('không có API key mà giọng đã bị khóa thì trả null, không rơi giọng', async () => {
    const oldKey = process.env.VIENEU_API_KEY
    const oldKeys = process.env.VIENEU_API_KEYS
    try {
      delete process.env.VIENEU_API_KEY
      delete process.env.VIENEU_API_KEYS
      expect(await vieneuTts.synthesize('Xin chào.', vieneuVoiceId())).toBeNull()
    } finally {
      if (oldKey !== undefined) process.env.VIENEU_API_KEY = oldKey
      if (oldKeys !== undefined) process.env.VIENEU_API_KEYS = oldKeys
    }
  }, 20_000)

  test('giọng khóa là edge thì uỷ quyền xuống edge, không gọi VieNeu', async () => {
    const result = await vieneuTts.synthesize('Xin chào.', 'edge:vi-VN-HoaiMyNeural')
    expect(result?.voice).not.toBe(vieneuVoiceId())
  }, 20_000)
})
