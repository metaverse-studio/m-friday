import { describe, expect, test } from 'bun:test'
import { getGroqApiKeys, getRandomGroqApiKey } from './groq'
import { getVieneuApiKeys, getRandomVieneuApiKey } from './audio/providers/vieneu-tts'

describe('Cơ chế rotate random pick API Keys', () => {
  const originalEnv = { ...process.env }

  test('Groq: xử lý đúng key đơn từ GROQ_API_KEY', () => {
    delete process.env.GROQ_API_KEYS
    process.env.GROQ_API_KEY = 'gsk_single_key'

    expect(getGroqApiKeys()).toEqual(['gsk_single_key'])
    expect(getRandomGroqApiKey()).toBe('gsk_single_key')
  })

  test('Groq: hỗ trợ nhiều keys phân tách bằng dấu phẩy hoặc khoảng trắng', () => {
    delete process.env.GROQ_API_KEY
    process.env.GROQ_API_KEYS = 'gsk_key_1, gsk_key_2,  gsk_key_3'

    const keys = getGroqApiKeys()
    expect(keys).toEqual(['gsk_key_1', 'gsk_key_2', 'gsk_key_3'])

    // Gọi 50 lần, đảm bảo mọi key đều được pick ít nhất một lần (random pick)
    const picked = new Set<string>()
    for (let i = 0; i < 50; i++) {
      picked.add(getRandomGroqApiKey())
    }
    expect(picked.has('gsk_key_1')).toBe(true)
    expect(picked.has('gsk_key_2')).toBe(true)
    expect(picked.has('gsk_key_3')).toBe(true)
  })

  test('Groq: trả về chuỗi rỗng khi không có key nào', () => {
    delete process.env.GROQ_API_KEY
    delete process.env.GROQ_API_KEYS

    expect(getGroqApiKeys()).toEqual([])
    expect(getRandomGroqApiKey()).toBe('')
  })

  test('VieNeu: xử lý đúng key đơn từ VIENEU_API_KEY', () => {
    delete process.env.VIENEU_API_KEYS
    process.env.VIENEU_API_KEY = 'vn_single_key'

    expect(getVieneuApiKeys()).toEqual(['vn_single_key'])
    expect(getRandomVieneuApiKey()).toBe('vn_single_key')
  })

  test('VieNeu: hỗ trợ nhiều keys phân tách bằng dấu phẩy và xoay tua ngẫu nhiên', () => {
    delete process.env.VIENEU_API_KEY
    process.env.VIENEU_API_KEYS = 'vn_key_a,vn_key_b,vn_key_c'

    const keys = getVieneuApiKeys()
    expect(keys).toEqual(['vn_key_a', 'vn_key_b', 'vn_key_c'])

    const picked = new Set<string>()
    for (let i = 0; i < 50; i++) {
      picked.add(getRandomVieneuApiKey())
    }
    expect(picked.has('vn_key_a')).toBe(true)
    expect(picked.has('vn_key_b')).toBe(true)
    expect(picked.has('vn_key_c')).toBe(true)
  })

  test('VieNeu: trả về chuỗi rỗng khi không có key nào', () => {
    delete process.env.VIENEU_API_KEY
    delete process.env.VIENEU_API_KEYS

    expect(getVieneuApiKeys()).toEqual([])
    expect(getRandomVieneuApiKey()).toBe('')
  })

  // Dọn dẹp biến môi trường về trạng thái ban đầu
  test('cleanup môi trường', () => {
    process.env = { ...originalEnv }
  })
})
