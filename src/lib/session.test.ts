import { describe, expect, test, beforeEach } from 'bun:test'
import { useSession } from './session'

describe('useSession', () => {
  beforeEach(() => {
    useSession.getState().resetSession()
  })

  test('trạng thái ban đầu', () => {
    const s = useSession.getState()
    expect(s.activeIntent).toBeNull()
    expect(s.chips).toEqual(['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE'])
    expect(s.history).toEqual([])
    expect(s.isListening).toBe(false)
    expect(s.isSpeaking).toBe(false)
  })

  test('unlock chuyển phase sang dashboard', () => {
    useSession.getState().unlock()
    expect(useSession.getState().phase).toBe('dashboard')
  })

  test('runIntent cập nhật activeIntent, history và nextChips', () => {
    useSession.getState().runIntent('CASH_FLOW')
    const s = useSession.getState()
    expect(s.activeIntent).toBe('CASH_FLOW')
    expect(s.history).toContain('CASH_FLOW')
    expect(s.chips).toEqual(['SUGGEST_CCTG', 'OBLIGATION_CALENDAR', 'PERIOD_COMPARE'])
  })

  test('resetSession đưa state về mặc định nhưng giữ phase', () => {
    useSession.getState().unlock()
    useSession.getState().runIntent('CASH_FLOW')
    useSession.getState().resetSession()
    const s = useSession.getState()
    expect(s.activeIntent).toBeNull()
    expect(s.chips).toEqual(['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE'])
    expect(s.history).toEqual([])
  })
})
