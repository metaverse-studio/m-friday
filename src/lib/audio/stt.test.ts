import { describe, expect, test } from 'bun:test'
import { POST } from '../../app/api/stt/route'

describe('API POST /api/stt', () => {
  test('xử lý an toàn khi không có audio', async () => {
    const fd = new FormData()
    const req = new Request('http://localhost:3000/api/stt', {
      method: 'POST',
      body: fd,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { text: string }
    expect(json.text).toBe('')
  })

  test('xử lý an toàn khi audio là chuỗi rác', async () => {
    const fd = new FormData()
    fd.append('audio', 'not-a-file')
    const req = new Request('http://localhost:3000/api/stt', {
      method: 'POST',
      body: fd,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { text: string }
    expect(json.text).toBe('')
  })

  test('xử lý an toàn khi audio 0-byte', async () => {
    const fd = new FormData()
    fd.append('audio', new Blob([], { type: 'audio/webm' }), 'empty.webm')
    const req = new Request('http://localhost:3000/api/stt', {
      method: 'POST',
      body: fd,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { text: string }
    expect(json.text).toBe('')
  })

  test('xử lý an toàn khi thiếu trường audio', async () => {
    const fd = new FormData()
    fd.append('other', 'value')
    const req = new Request('http://localhost:3000/api/stt', {
      method: 'POST',
      body: fd,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { text: string }
    expect(json.text).toBe('')
  })
})
