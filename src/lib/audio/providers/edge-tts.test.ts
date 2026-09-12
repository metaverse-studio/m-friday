import { describe, expect, test } from 'bun:test'
import { edgeTts } from './edge-tts'

describe('edgeTts provider', () => {
  test('synthesize sinh ra buffer âm thanh MP3 thực tế (> 500 bytes)', async () => {
    const audio = await edgeTts.synthesize('Xin chào Mr Stark.')
    expect(audio).toBeInstanceOf(Buffer)
    expect(audio.length).toBeGreaterThan(500)
  })

  test('synthesize với câu tiếng Việt dài hoàn thành không ném lỗi', async () => {
    const line =
      'Dạ em báo cáo Mr Stark, trong 7 ngày qua dòng tiền doanh nghiệp thặng dư ròng 18,2 tỷ VNĐ ạ.'
    const audio = await edgeTts.synthesize(line)
    expect(audio.length).toBeGreaterThan(1000)
  })
})
