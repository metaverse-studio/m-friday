import { describe, expect, test } from 'bun:test'
import { normalizePronunciation } from './pronunciation'

describe('Chuẩn hóa phát âm cho TTS', () => {
  test('chuyển M-Tròn thành Em Tròn khi đọc', () => {
    expect(
      normalizePronunciation('Chào Mr Stark. Em là M-Tròn, Trợ lý Quan hệ Khách hàng.'),
    ).toBe('Chào Mr Stark. Em là Em Tròn, Trợ lý Quan hệ Khách hàng.')
  })

  test('chuyển M-tròn thành em tròn', () => {
    expect(normalizePronunciation('Trợ lý M-tròn sẵn sàng.')).toBe(
      'Trợ lý em tròn sẵn sàng.',
    )
  })

  test('giữ nguyên các câu không chứa M-Tròn', () => {
    expect(normalizePronunciation('Dòng tiền ròng tuần này dương 12,5 tỷ.')).toBe(
      'Dòng tiền ròng tuần này dương 12,5 tỷ.',
    )
  })
})
