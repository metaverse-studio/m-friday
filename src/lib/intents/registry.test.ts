import { describe, expect, test } from 'bun:test'
import { BUSINESS_INTENT_IDS, INTENTS, getIntent } from './registry'
import type { IntentId } from './types'

describe('Registry', () => {
  test('có đủ 17 intent', () => {
    expect(Object.keys(INTENTS)).toHaveLength(17)
  })

  test('có đúng 14 intent nghiệp vụ', () => {
    expect(BUSINESS_INTENT_IDS).toHaveLength(14)
  })

  test('intent nghiệp vụ không bao gồm sự kiện hệ thống hay dự phòng', () => {
    expect(BUSINESS_INTENT_IDS).not.toContain('FIDO_LOGIN')
    expect(BUSINESS_INTENT_IDS).not.toContain('GREETING')
    expect(BUSINESS_INTENT_IDS).not.toContain('UNKNOWN')
  })

  test('mỗi intent có id khớp với khóa của nó', () => {
    for (const [key, intent] of Object.entries(INTENTS)) {
      expect(intent.id).toBe(key as IntentId)
    }
  })

  test('mọi intent nghiệp vụ đều có keyword và fallbackLine', () => {
    for (const id of BUSINESS_INTENT_IDS) {
      const intent = getIntent(id)
      expect(intent.keywords.length).toBeGreaterThan(0)
      expect(intent.fallbackLine.length).toBeGreaterThan(0)
    }
  })

  test('nextChips chỉ trỏ tới intent có thật', () => {
    for (const intent of Object.values(INTENTS)) {
      for (const chipId of intent.nextChips) {
        expect(INTENTS[chipId]).toBeDefined()
      }
    }
  })

  test('nextChips không bao giờ chứa UNKNOWN', () => {
    for (const intent of Object.values(INTENTS)) {
      expect(intent.nextChips).not.toContain('UNKNOWN')
    }
  })

  test('các lệnh đổi trạng thái đều yêu cầu FIDO', () => {
    const mustRequireFido: IntentId[] = [
      'APPROVE_FIDO',
      'REJECT_ORDER',
      'SUGGEST_CCTG',
      'FX_FORWARD',
    ]
    for (const id of mustRequireFido) {
      expect(getIntent(id).requiresFido).toBe(true)
    }
  })

  test('fallbackLine luôn xưng em và gọi Mr Stark hoặc anh', () => {
    for (const id of BUSINESS_INTENT_IDS) {
      const line = getIntent(id).fallbackLine
      expect(/\b(em|Em)\b/.test(line)).toBe(true)
    }
  })
})
