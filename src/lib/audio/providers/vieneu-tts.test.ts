import { describe, expect, test } from 'bun:test'
import { getTtsProvider } from './index'
import { vieneuTts } from './vieneu-tts'
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
    const audio = await vieneuTts.synthesize('Xin chào Mr Stark.')
    expect(audio).toBeInstanceOf(Buffer)
    expect(audio.length).toBeGreaterThan(500)
  }, 15_000)

  test('vieneuTts.synthesize câu tiếng Việt dài hoàn thành tốt', async () => {
    const line = 'Báo cáo Mr Stark, trong 7 ngày qua dòng tiền doanh nghiệp thặng dư ròng 18,2 tỷ VNĐ ạ.'
    const audio = await vieneuTts.synthesize(line)
    expect(audio).toBeInstanceOf(Buffer)
    expect(audio.length).toBeGreaterThan(1000)
  }, 15_000)
})
