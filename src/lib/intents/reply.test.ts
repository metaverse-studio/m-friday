import { describe, expect, test } from 'bun:test'
import { POST } from '../../app/api/reply/route'

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
