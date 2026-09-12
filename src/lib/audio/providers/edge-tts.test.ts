import { describe, expect, test } from 'bun:test'
import { EDGE_VOICE_ID, MAC_VOICE_ID, edgeTts } from './edge-tts'

describe('edgeTts provider', () => {
  test('synthesize sinh ra buffer âm thanh MP3 thực tế (> 500 bytes)', async () => {
    const result = await edgeTts.synthesize('Xin chào Mr Stark.')
    expect(result).not.toBeNull()
    expect(result!.audio).toBeInstanceOf(Buffer)
    expect(result!.audio.length).toBeGreaterThan(500)
  })

  test('synthesize với câu tiếng Việt dài hoàn thành không ném lỗi', async () => {
    const line =
      'Dạ em báo cáo Mr Stark, trong 7 ngày qua dòng tiền doanh nghiệp thặng dư ròng 18,2 tỷ VNĐ ạ.'
    const result = await edgeTts.synthesize(line)
    expect(result!.audio.length).toBeGreaterThan(1000)
  })

  test('báo đúng giọng đã dùng, không chỉ báo thành công', async () => {
    const result = await edgeTts.synthesize('Xin chào.')
    expect([EDGE_VOICE_ID, MAC_VOICE_ID]).toContain(result!.voice)
  })

  test('giọng bị khóa ngoài provider này thì trả null thay vì đổi giọng', async () => {
    expect(await edgeTts.synthesize('Xin chào.', 'vieneu:Ngọc Lan')).toBeNull()
  })
})
