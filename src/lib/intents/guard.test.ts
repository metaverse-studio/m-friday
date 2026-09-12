import { describe, expect, test } from 'bun:test'
import { extractNumberTokens, findViolations, isSafeReply } from './guard'

describe('extractNumberTokens', () => {
  test('trích số có dấu phẩy thập phân', () => {
    expect(extractNumberTokens('thặng dư 18,2 tỷ')).toEqual(['18,2'])
  })

  test('trích số có dấu chấm phân nhóm', () => {
    expect(extractNumberTokens('tỷ giá 26.180 đồng')).toEqual(['26.180'])
  })

  test('trích nhiều số trong một câu', () => {
    expect(extractNumberTokens('12/12 lệnh, 48,5 tỷ')).toEqual(['12/12', '48,5'])
  })

  test('bỏ dấu câu bám đuôi', () => {
    expect(extractNumberTokens('còn 15 tỷ.')).toEqual(['15'])
  })

  test('trả mảng rỗng khi không có số', () => {
    expect(extractNumberTokens('Dạ em đã ghi nhận ạ')).toEqual([])
  })
})

describe('findViolations', () => {
  test('không báo vi phạm khi mọi số đều hợp lệ', () => {
    expect(findViolations('thặng dư ròng 18,2 tỷ', ['18,2', '7'])).toEqual([])
  })

  test('bắt được số bịa', () => {
    expect(findViolations('thặng dư ròng 4,85 tỷ', ['18,2'])).toEqual(['4,85'])
  })

  test('bắt được nhiều số bịa cùng lúc', () => {
    expect(findViolations('thu 99 chi 88', ['65'])).toEqual(['99', '88'])
  })
})

describe('isSafeReply', () => {
  test('chấp nhận lời thoại dùng đúng số của intent', () => {
    const reply = 'Báo cáo Mr Stark, 7 ngày qua dòng tiền thặng dư ròng 18,2 tỷ VNĐ ạ.'
    expect(isSafeReply(reply, 'CASH_FLOW')).toBe(true)
  })

  test('từ chối lời thoại chứa số không có trong fixtures', () => {
    const reply = 'Báo cáo Mr Stark, dòng tiền thặng dư ròng 91,7 tỷ VNĐ ạ.'
    expect(isSafeReply(reply, 'CASH_FLOW')).toBe(false)
  })

  test('chấp nhận lời thoại hoàn toàn không có số', () => {
    expect(isSafeReply('Dạ em đã ghi nhận ạ.', 'REJECT_ORDER')).toBe(true)
  })
})
