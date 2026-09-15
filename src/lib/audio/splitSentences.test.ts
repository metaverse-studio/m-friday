import { describe, expect, test } from 'bun:test'
import { splitSentences } from './player'

describe('splitSentences', () => {
  test('cắt theo dấu chấm', () => {
    expect(splitSentences('Chào anh Stark. Em là M-Tròn.')).toEqual([
      'Chào anh Stark.',
      'Em là M-Tròn.',
    ])
  })

  test('cắt theo dấu phẩy khi câu dài', () => {
    const long =
      'Báo cáo Mr Stark, trong bảy ngày qua dòng tiền của doanh nghiệp đang thặng dư ròng mười tám phẩy hai tỷ đồng, các khoản thu đã về đủ.'
    const parts = splitSentences(long)
    expect(parts.length).toBeGreaterThan(1)
  })

  test('không cắt số thập phân', () => {
    expect(splitSentences('Thặng dư 18,2 tỷ đồng.')).toEqual([
      'Thặng dư 18,2 tỷ đồng.',
    ])
  })

  test('bỏ qua mảnh rỗng', () => {
    expect(splitSentences('Xong.  ')).toEqual(['Xong.'])
  })

  test('trả mảng rỗng với chuỗi rỗng', () => {
    expect(splitSentences('')).toEqual([])
  })
})

describe('fallbackUrlFor', () => {
  test('trả đúng đường dẫn tĩnh tới thư mục fallback', async () => {
    const { fallbackUrlFor } = await import('./player')
    expect(fallbackUrlFor('CASH_FLOW')).toBe('/audio/fallback/CASH_FLOW.mp3')
    expect(fallbackUrlFor('UNKNOWN')).toBe('/audio/fallback/UNKNOWN.mp3')
  })
})

