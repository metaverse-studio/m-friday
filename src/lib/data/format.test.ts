import { describe, expect, test } from 'bun:test'
import {
  formatPercent,
  formatTrieu,
  formatTrieuRaw,
  formatTy,
  formatTyFixed1,
  formatTyRaw,
  formatTyRawFixed1,
} from './format'

describe('formatTy', () => {
  test('rút gọn về một chữ số thập phân, dùng dấu phẩy', () => {
    expect(formatTy(18_200_000_000)).toBe('18,2 tỷ')
  })
  test('bỏ phần thập phân khi tròn số', () => {
    expect(formatTy(15_000_000_000)).toBe('15 tỷ')
  })
  test('làm tròn xuống đúng', () => {
    expect(formatTy(27_540_000_000)).toBe('27,5 tỷ')
  })
})

describe('formatTyRaw', () => {
  test('chỉ trả về phần số rút gọn, không kèm chữ tỷ', () => {
    expect(formatTyRaw(18_200_000_000)).toBe('18,2')
    expect(formatTyRaw(15_000_000_000)).toBe('15')
    expect(formatTyRaw(5_200_000_000)).toBe('5,2')
    expect(formatTyRaw(48_500_000_000)).toBe('48,5')
  })
})

describe('formatTyFixed1', () => {
  test('luôn giữ một chữ số thập phân, kể cả khi tròn số', () => {
    expect(formatTyFixed1(65_000_000_000)).toBe('65,0 tỷ')
    expect(formatTyFixed1(50_000_000_000)).toBe('50,0 tỷ')
    expect(formatTyFixed1(30_000_000_000)).toBe('30,0 tỷ')
    expect(formatTyFixed1(46_800_000_000)).toBe('46,8 tỷ')
  })
})

describe('formatTyRawFixed1', () => {
  test('luôn giữ một chữ số thập phân không kèm chữ tỷ', () => {
    expect(formatTyRawFixed1(18_000_000_000)).toBe('18,0')
    expect(formatTyRawFixed1(15_000_000_000)).toBe('15,0')
    expect(formatTyRawFixed1(42_000_000_000)).toBe('42,0')
    expect(formatTyRawFixed1(11_500_000_000)).toBe('11,5')
  })
})

describe('formatTrieu', () => {
  test('rút gọn về một chữ số thập phân', () => {
    expect(formatTrieu(33_287_671)).toBe('33,3 triệu')
  })
  test('bỏ phần thập phân khi tròn số', () => {
    expect(formatTrieu(32_500_000)).toBe('32,5 triệu')
  })
})

describe('formatTrieuRaw', () => {
  test('chỉ trả về phần số rút gọn, không kèm chữ triệu', () => {
    expect(formatTrieuRaw(850_000_000)).toBe('850')
    expect(formatTrieuRaw(33_287_671)).toBe('33,3')
  })
})

describe('formatPercent', () => {
  test('dùng dấu phẩy thập phân kiểu Việt Nam', () => {
    expect(formatPercent(19.8)).toBe('19,8%')
  })
  test('bỏ phần thập phân khi tròn số', () => {
    expect(formatPercent(20)).toBe('20%')
  })
})
