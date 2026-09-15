import { describe, expect, test } from 'bun:test'
import { POST } from '../../app/api/reply/route'
import { INTENTS } from './registry'

describe('API POST /api/reply', () => {
  test('xử lý an toàn khi body rỗng', async () => {
    const req = new Request('http://localhost:3000/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { reply: string; source: string }
    expect(json.reply).toBeDefined()
    expect(typeof json.reply).toBe('string')
  })

  test('xử lý an toàn khi intentId không hợp lệ', async () => {
    const req = new Request('http://localhost:3000/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentId: 'INVALID_ID_TEST' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { reply: string; source: string }
    expect(json.reply).toBeDefined()
  })

  /**
   * Lỗi gốc: GREETING đi qua LLM, mà prompt dựng từ `description` của nó là
   * chú thích kỹ thuật, nên LLM thuyết minh về "hệ thống tự chạy sau khi đăng
   * nhập" thay vì chào khách. Lời tự giới thiệu phải nguyên văn.
   */
  test('GREETING luôn trả đúng lời chào, không cho LLM viết lại', async () => {
    const req = new Request('http://localhost:3000/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentId: 'GREETING' }),
    })
    const res = await POST(req)
    const json = (await res.json()) as { reply: string; source: string }
    expect(json.source).toBe('fixed')
    expect(json.reply).toBe(INTENTS.GREETING.fallbackLine)
    expect(json.reply).toContain('Em là M-Tròn')
    expect(json.reply).toContain('MSB Business')
  })

  test('trả fallbackLine hợp lệ cho CASH_FLOW khi LLM không kết nối', async () => {
    const req = new Request('http://localhost:3000/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentId: 'CASH_FLOW' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { reply: string; source: string }
    expect(json.reply).toContain('18,2 tỷ')
  })
})
